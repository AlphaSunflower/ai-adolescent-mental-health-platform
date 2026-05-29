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

interface Patient {
  id: number; patientName: string; gender: string; age: number;
  lastVisitTime: string;
}

interface PageData {
  total: number; current: number; pages: number; records: Patient[];
}

export function PatientArchives() {
  const [data, setData] = useState<PageData>({ total: 0, current: 1, pages: 1, records: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [keyword, setKeyword] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [size] = useState(10);

  const fetchData = (p: number) => {
    setLoading(true); setError(null);
    httpClient.get<PageData>("/doctor/patients", { query: { page: p, size, keyword } })
      .then((res) => { setData(res); setPage(p); })
      .catch((err: unknown) => { setError(err instanceof Error ? err.message : "Unknown error"); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(1); }, [keyword]);

  const handleSearch = () => { setKeyword(searchInput); };

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
        <h3 style={{ margin: "0 0 20px 0", fontSize: "16px", fontWeight: 600, color: s.text }}>患者档案</h3>

        {error && (
          <div style={{ marginBottom: "16px", padding: "10px 16px", backgroundColor: "#fef0f0", color: s.red, borderRadius: s.radius, fontSize: "13px" }}>
            {error}
            <button onClick={() => setError(null)} style={{ marginLeft: "12px", color: s.red, border: "none", background: "none", cursor: "pointer" }}>关闭</button>
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
          <div style={{ display: "flex", gap: "10px" }}>
            <input placeholder="搜索患者姓名..." value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
              style={{ height: "36px", padding: "0 12px", border: "1px solid " + s.border, borderRadius: s.radius, width: "240px" }} />
            <button onClick={handleSearch} style={{ height: "36px", padding: "0 20px", backgroundColor: s.primary, color: s.white, border: "none", borderRadius: s.radius, cursor: "pointer" }}>搜索</button>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: s.text3 }}>加载中...</div>
        ) : (
          <>
            <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #ebeef5" }}>
              <thead>
                <tr style={{ backgroundColor: "#f5f7fa" }}>
                  <th style={thStyle}>ID</th>
                  <th style={thStyle}>患者姓名</th>
                  <th style={thStyle}>性别</th>
                  <th style={thStyle}>年龄</th>
                  <th style={thStyle}>最后就诊时间</th>
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
                      <td style={tdStyle}>{row.patientName}</td>
                      <td style={tdStyle}>{row.gender ?? "-"}</td>
                      <td style={tdStyle}>{row.age ?? "-"}</td>
                      <td style={tdStyle}>{row.lastVisitTime ?? "-"}</td>
                      <td style={tdStyle}>
                        <button style={{ color: s.primary, border: "none", background: "none", cursor: "pointer" }}>查看详情</button>
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
