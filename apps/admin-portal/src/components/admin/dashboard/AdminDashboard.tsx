"use client";

import { useState, useEffect, useRef } from "react";
import * as echarts from "echarts";
import { httpClient } from "@/lib/api-admin";

interface AdminOverview {
  totalUsers: number;
  monthlyNewUsers: number;
  totalHospitals: number;
  totalDoctors: number;
  totalPsychologists: number;
  totalArticles: number;
  totalAssessments: number;
  monthlyConsultations: number[];
  totalConsultations: number;
}

const MONTH_LABELS = [
  "1月", "2月", "3月", "4月", "5月", "6月",
  "7月", "8月", "9月", "10月", "11月", "12月",
];

/* ========== StatCard ========== */

interface StatCardProps {
  label: string;
  value: number;
  color: string;
  icon: string;
}

const CARD_BOX: React.CSSProperties = {
  backgroundColor: "#fff",
  borderRadius: "8px",
  boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
  padding: "20px",
  display: "flex",
  alignItems: "center",
  gap: "16px",
};

function StatCard({ label, value, color, icon }: StatCardProps) {
  return (
    <div style={CARD_BOX}>
      <span style={{
        width: "56px",
        height: "56px",
        borderRadius: "12px",
        backgroundColor: `${color}18`,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "24px",
        fontWeight: 700,
        color,
        flexShrink: 0,
        lineHeight: 1,
      }}>
        {icon}
      </span>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: "14px", color: "#909399", marginBottom: "4px" }}>{label}</div>
        <div style={{ fontSize: "28px", fontWeight: 700, color: "#303133", lineHeight: 1.2 }}>
          {(value ?? 0).toLocaleString()}
        </div>
      </div>
    </div>
  );
}

/* ========== AdminDashboard ========== */

export function AdminDashboard() {
  const [data, setData] = useState<AdminOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInst = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    httpClient
      .get<AdminOverview>("/stats/admin/overview")
      .then(setData)
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : "Unknown error";
        console.error("Failed to load admin overview:", msg);
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!data || !chartRef.current) return;

    if (chartInst.current) chartInst.current.dispose();

    const chart = echarts.init(chartRef.current);
    chartInst.current = chart;

    const consultationData = data.monthlyConsultations ?? [];
    const labels = MONTH_LABELS.slice(0, consultationData.length || 12);

    chart.setOption({
      tooltip: { trigger: "axis" },
      grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
      xAxis: {
        type: "category",
        data: labels,
        boundaryGap: false,
      },
      yAxis: { type: "value", minInterval: 1 },
      series: [
        {
          name: "咨询量",
          type: "line",
          data: consultationData,
          smooth: true,
          lineStyle: { color: "#409eff", width: 3 },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: "rgba(64,158,255,0.35)" },
              { offset: 1, color: "rgba(64,158,255,0.02)" },
            ]),
          },
          itemStyle: { color: "#409eff" },
        },
      ],
    });

    const handleResize = () => chart.resize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      chart.dispose();
    };
  }, [data]);

  if (loading) {
    return <div style={{ padding: "40px", textAlign: "center", color: "#909399" }}>加载中...</div>;
  }

  if (error || !data) {
    return <div style={{ padding: "40px", textAlign: "center", color: "#f56c6c" }}>数据加载失败: {error ?? "未知错误"}</div>;
  }

  const d = data;

  return (
    <div>
      <h2 style={{ margin: "0 0 20px 0", fontSize: "20px", fontWeight: 600, color: "#303133" }}>
        工作概览
      </h2>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "16px" }}>
        <StatCard label="用户总数" value={d.totalUsers} color="#409eff" icon="用" />
        <StatCard label="本月新增" value={d.monthlyNewUsers} color="#67c23a" icon="新" />
        <StatCard label="医院数量" value={d.totalHospitals} color="#e6a23c" icon="院" />
        <StatCard label="咨询师数量" value={(d.totalDoctors ?? 0) + (d.totalPsychologists ?? 0)} color="#f56c6c" icon="咨" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px", marginBottom: "16px" }}>
        <StatCard label="文章总数" value={d.totalArticles} color="#409eff" icon="文" />
        <StatCard label="测评总数" value={d.totalAssessments} color="#67c23a" icon="测" />
      </div>

      <div style={{
        backgroundColor: "#fff",
        borderRadius: "8px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        padding: "20px",
      }}>
        <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", fontWeight: 600, color: "#303133" }}>
          月度咨询趋势
        </h3>
        <div ref={chartRef} style={{ height: "400px", width: "100%" }} />
      </div>
    </div>
  );
}
