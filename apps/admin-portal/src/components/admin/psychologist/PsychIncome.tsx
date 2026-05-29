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

interface IncomeRecord {
  id: number; date: string; duration: string; amount: number; status: string;
}

interface PageData {
  total: number; current: number; pages: number; records: IncomeRecord[];
  totalIncome: number;
}

export function PsychIncome() {
  const [data, setData] = useState<PageData>({ total: 0, current: 1, pages: 1, records: [], totalIncome: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [size] = useState(10);

  const fetchData = (p: number) => {
    setLoading(true); setError(null);
    httpClient.get<PageData>("/psychologist/income/list", { query: { page: p, size } })
      .then((res) => { setData(res); setPage(p); })
      .catch((err: unknown) => { setError(err instanceof Error ? err.message : "Unknown error"); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(1); }, []);

  const statusTag = (status: string) => {
    const color = status === "已结算" ? s.green : s.orange;
    const bg = status === "已结算" ? "#f0f9eb" : "#fdf6ec";
    return (<span style={{ display: "inline-block", padding: "2px 8px", borderRadius: s.radius, backgroundColor: bg, color, fontSize: "12px", fontWeight: 500 }}>{status}</span>);
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
      <div style={{ backgroundColor: s.white, borderRadius: "8px", boxShadow: s.shadow, padding: "20px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "24px" }}>
        <div style={{ textAlign: "center", minWidth: "120px" }}>
          <div style={{ fontSize: "13px", color: s.text3, marginBottom: "8px" }}>总收入（元）</div>
          <div style={{ fontSize: "32px", fontWeight: 700, color: s.primary }}>{data.totalIncome.toLocaleString()}</div>
        </div>
        <div style={{ width: "1px", height: "48px", backgroundColor: s.border }}></div>
        <div style={{ textAlign: "center", minWidth: "100px" }}>
          <div style={{ fontSize: "13px", color: s.text3, marginBottom: "8px" }}>记录数</div>
          <div style={{ fontSize: "24px", fontWeight: 600, color: s.text }}>{data.total} 笔</div>
        </div>
      </div>

      <div style={{ backgroundColor: s.white, borderRadius: "8px", boxShadow: s.shadow, padding: "20px" }}>
        <h3 style={{ margin: "0 0 20px 0", fontSize: "16px", fontWeight: 600, color: s.text }}>收入明细</h3>

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
                  <th style={thStyle}>日期</th>
                  <th style={thStyle}>咨询时长</th>
                  <th style={thStyle}>收入金额</th>
                  <th style={thStyle}>状态</th>
                </tr>
              </thead>
              <tbody>
                {data.records.length === 0 ? (
                  <tr><td colSpan={4} style={{ ...tdStyle, textAlign: "center", color: s.text3 }}>暂无数据</td></tr>
                ) : (
                  data.records.map((row, i) => (
                    <tr key={row.id} style={{ backgroundColor: i % 2 === 0 ? s.white : "#fafafa" }}>
                      <td style={tdStyle}>{row.date}</td>
                      <td style={tdStyle}>{row.duration}</td>
                      <td style={tdStyle}>{row.amount.toLocaleString()} 元</td>
                      <td style={tdStyle}>{statusTag(row.status)}</td>
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
