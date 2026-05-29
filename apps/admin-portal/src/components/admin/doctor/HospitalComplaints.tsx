"use client";

import { useState, useEffect } from "react";
import { httpClient } from "@/lib/api-admin";

const s = {
  primary: "#409eff", green: "#67c23a", orange: "#e6a23c", red: "#f56c6c",
  text: "#303133", text2: "#606266", text3: "#909399",
  border: "#dcdfe6", bg: "#f0f2f5", white: "#fff",
  radius: "4px", shadow: "0 2px 12px rgba(0,0,0,0.06)",
  statCardBg: "#fff",
};

interface Complaint {
  id: number; complainantName: string; respondentName: string;
  content: string; status: string; createTime: string;
}

interface PageData {
  total: number; current: number; pages: number; records: Complaint[];
}

export function HospitalComplaints() {
  const [data, setData] = useState<PageData>({ total: 0, current: 1, pages: 1, records: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [size] = useState(10);

  const fetchData = (p: number) => {
    setLoading(true); setError(null);
    httpClient.get<PageData>("/complaint/list", { query: { page: p, size } })
      .then((res) => { setData(res); setPage(p); })
      .catch((err: unknown) => { setError(err instanceof Error ? err.message : "Unknown error"); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(1); }, []);

  const handleProcess = async (id: number) => {
    try {
      await httpClient.put("/complaint/" + id, { status: "已处理" });
      fetchData(page);
    } catch (err: unknown) { setError(err instanceof Error ? err.message : "Unknown error"); }
  };

  const statusTag = (status: string) => {
    const color = status === "已处理" ? s.green : status === "处理中" ? s.orange : s.red;
    const bg = status === "已处理" ? "#f0f9eb" : status === "处理中" ? "#fdf6ec" : "#fef0f0";
    return (<span style={{ display: "inline-block", padding: "2px 8px", borderRadius: s.radius, backgroundColor: bg, color, fontSize: "12px", fontWeight: 500 }}>{status ?? "待处理"}</span>);
  };

  const thStyle: React.CSSProperties = {
    padding: "12px 8px", textAlign: "left" as const, fontSize: "13px",
    color: s.text3, fontWeight: 600, borderBottom: "1px solid #ebeef5",
  };
  const tdStyle: React.CSSProperties = {
    padding: "12px 8px", borderBottom: "1px solid #ebeef5", fontSize: "13px",
  };

  return (
    <div style={{ padding: "20px", backgroundColor: s.bg, minHeight: "100%" }}>
      <div style={{ backgroundColor: s.white, borderRadius: "8px", boxShadow: s.shadow, padding: "20px" }}>
        <h3 style={{ margin: "0 0 20px 0", fontSize: "16px", fontWeight: 600, color: s.text }}>投诉管理</h3>

        {error && (
          <div style={{ marginBottom: "16px", padding: "10px 16px", backgroundColor: "#fef0f0", color: s.red, borderRadius: s.radius, fontSize: "13px" }}>
            {error}
            <button onClick={() => setError(null)} style={{ marginLeft: "12px", color: s.red, border: "none", background: "none", cursor: "pointer" }}>关闭</button>
          </div>
        )}

        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: s.text3 }}>加载中...</div>
        ) : (
          <>
            <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #ebeef5" }}>
              <thead>
                <tr style={{ backgroundColor: "#f5f7fa" }}>
                  <th style={thStyle}>ID</th>
                  <th style={thStyle}>投诉人</th>
                  <th style={thStyle}>被投诉人</th>
                  <th style={thStyle}>内容</th>
                  <th style={thStyle}>状态</th>
                  <th style={thStyle}>操作</th>
                </tr>
              </thead>
              <tbody>
                {data.records.length === 0 ? (
                  <tr><td colSpan={6} style={{ ...tdStyle, textAlign: "center", color: s.text3 }}>暂无数据</td></tr>
                ) : (
                  data.records.map((row, i) => (
                    <tr key={row.id} style={{ backgroundColor: i % 2 === 0 ? s.white : "#fafafa" }}>
                      <td style={tdStyle}>{row.id}</td>
                      <td style={tdStyle}>{row.complainantName ?? "-"}</td>
                      <td style={tdStyle}>{row.respondentName ?? "-"}</td>
                      <td style={{ ...tdStyle, maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.content ?? "-"}</td>
                      <td style={tdStyle}>{statusTag(row.status)}</td>
                      <td style={tdStyle}>
                        {row.status !== "已处理" && (
                          <button onClick={() => handleProcess(row.id)} style={{ color: s.primary, border: "none", background: "none", cursor: "pointer" }}>处理</button>
                        )}
                        {row.status === "已处理" && <span style={{ color: s.text3, fontSize: "12px" }}>已完成</span>}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "16px", gap: "8px", alignItems: "center" }}>
              <span style={{ fontSize: "13px", color: s.text2 }}>共 {data.total} 条</span>
              <button onClick={() => fetchData(page - 1)} disabled={page <= 1}
                style={{ padding: "6px 12px", border: "1px solid " + s.border, borderRadius: s.radius, background: s.white, cursor: page <= 1 ? "not-allowed" : "pointer", opacity: page <= 1 ? 0.5 : 1 }}>上一页</button>
              <span style={{ fontSize: "13px", color: s.text2 }}>{page} / {data.pages}</span>
              <button onClick={() => fetchData(page + 1)} disabled={page >= data.pages}
                style={{ padding: "6px 12px", border: "1px solid " + s.border, borderRadius: s.radius, background: s.white, cursor: page >= data.pages ? "not-allowed" : "pointer", opacity: page >= data.pages ? 0.5 : 1 }}>下一页</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
