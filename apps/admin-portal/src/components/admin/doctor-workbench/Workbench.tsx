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

interface WorkbenchData {
  doctorName: string; title: string; hospitalName: string;
  todayAppointments: number; pendingAppointments: number; completedAppointments: number;
  todayPatients: Array<{ id: number; patientName: string; time: string; status: string; }>;
}

export function Workbench() {
  const [data, setData] = useState<WorkbenchData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    httpClient.get<WorkbenchData>("/stats/doctor/overview")
      .then(setData)
      .catch((err: unknown) => { setError(err instanceof Error ? err.message : "Unknown error"); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: "40px", textAlign: "center", color: s.text3 }}>加载中...</div>;
  if (error || !data) return <div style={{ padding: "40px", textAlign: "center", color: s.red }}>数据加载失败: {error ?? "未知错误"}</div>;

  const tdStyle: React.CSSProperties = {
    padding: "12px 8px", borderBottom: "1px solid #ebeef5", fontSize: "13px",
  };

  return (
    <div style={{ padding: "20px", backgroundColor: s.bg, minHeight: "100%" }}>
      <div style={{ backgroundColor: s.white, borderRadius: "8px", boxShadow: s.shadow, padding: "24px 20px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "16px" }}>
        <span style={{ width: "48px", height: "48px", borderRadius: "12px", backgroundColor: s.green + "18", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "22px", fontWeight: 700, color: s.green, flexShrink: 0 }}>医</span>
        <div>
          <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 600, color: s.text }}>{data.doctorName}
            <span style={{ fontSize: "13px", fontWeight: 500, color: s.text3, marginLeft: "10px", padding: "2px 8px", backgroundColor: s.bg, borderRadius: s.radius }}>{data.title}</span>
          </h2>
          <div style={{ fontSize: "13px", color: s.text3, marginTop: "4px" }}>{data.hospitalName}</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "16px" }}>
        {[
          { label: "今日预约", value: data.todayAppointments, color: s.primary, icon: "今" },
          { label: "待处理", value: data.pendingAppointments, color: s.orange, icon: "待" },
          { label: "已完成", value: data.completedAppointments, color: s.green, icon: "完" },
        ].map((item) => (
          <div key={item.label} style={{ backgroundColor: s.white, borderRadius: "8px", boxShadow: s.shadow, padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
            <span style={{ width: "56px", height: "56px", borderRadius: "12px", backgroundColor: item.color + "18", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "24px", fontWeight: 700, color: item.color, flexShrink: 0 }}>{item.icon}</span>
            <div>
              <div style={{ fontSize: "14px", color: s.text3, marginBottom: "4px" }}>{item.label}</div>
              <div style={{ fontSize: "28px", fontWeight: 700, color: s.text }}>{item.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ backgroundColor: s.white, borderRadius: "8px", boxShadow: s.shadow, padding: "20px" }}>
        <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", fontWeight: 600, color: s.text }}>今日患者</h3>
        <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #ebeef5" }}>
          <thead>
            <tr style={{ backgroundColor: "#f5f7fa" }}>
              <th style={{ padding: "12px 8px", textAlign: "left", fontSize: "13px", color: s.text3, fontWeight: 600, borderBottom: "1px solid #ebeef5" }}>患者姓名</th>
              <th style={{ padding: "12px 8px", textAlign: "left", fontSize: "13px", color: s.text3, fontWeight: 600, borderBottom: "1px solid #ebeef5" }}>预约时间</th>
              <th style={{ padding: "12px 8px", textAlign: "left", fontSize: "13px", color: s.text3, fontWeight: 600, borderBottom: "1px solid #ebeef5" }}>状态</th>
            </tr>
          </thead>
          <tbody>
            {(data.todayPatients ?? []).length === 0 ? (
              <tr><td colSpan={3} style={{ ...tdStyle, textAlign: "center", color: s.text3 }}>今日暂无预约</td></tr>
            ) : (
              (data.todayPatients ?? []).map((p, i) => (
                <tr key={p.id} style={{ backgroundColor: i % 2 === 0 ? s.white : "#fafafa" }}>
                  <td style={tdStyle}>{p.patientName}</td>
                  <td style={tdStyle}>{p.time}</td>
                  <td style={tdStyle}>{p.status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
