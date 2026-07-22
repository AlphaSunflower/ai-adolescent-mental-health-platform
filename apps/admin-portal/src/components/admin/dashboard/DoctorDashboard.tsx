"use client";

import { useState, useEffect, useRef } from "react";
import { tokens } from "@/lib/design-tokens";
import * as echarts from "echarts";
import { httpClient } from "@/lib/api-admin";

interface DoctorOverview {
  doctorName: string;
  title: string;
  hospitalName: string;
  totalPatients: number;
  patientCount: number;
  todayAppointments: number;
  pendingAppointments: number;
  completedAppointments: number;
  monthlyAppointments: number[];
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
        <div style={{ fontSize: "14px", color: tokens.textSecondary, marginBottom: "4px" }}>{label}</div>
        <div style={{ fontSize: "28px", fontWeight: 700, color: tokens.textPrimary, lineHeight: 1.2 }}>
          {(value ?? 0).toLocaleString()}
        </div>
      </div>
    </div>
  );
}

/* ========== DoctorDashboard ========== */

export function DoctorDashboard() {
  const [data, setData] = useState<DoctorOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInst = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    httpClient
      .get<DoctorOverview>("/stats/doctor/overview")
      .then(setData)
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Unknown error");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!data || !chartRef.current) return;

    if (chartInst.current) chartInst.current.dispose();

    const chart = echarts.init(chartRef.current);
    chartInst.current = chart;

    const appointmentData = data.monthlyAppointments ?? [];
    const labels = MONTH_LABELS.slice(0, appointmentData.length || 12);

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
          name: "预约量",
          type: "line",
          data: appointmentData,
          smooth: true,
          lineStyle: { color: tokens.success, width: 3 },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: "rgba(103,194,58,0.35)" },
              { offset: 1, color: "rgba(103,194,58,0.02)" },
            ]),
          },
          itemStyle: { color: tokens.success },
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
    return <div style={{ padding: "40px", textAlign: "center", color: tokens.textSecondary }}>加载中...</div>;
  }

  if (error || !data) {
    return <div style={{ padding: "40px", textAlign: "center", color: tokens.danger }}>数据加载失败: {error ?? "未知错误"}</div>;
  }

  const d = data;

  return (
    <div>
      <div style={{
        backgroundColor: "#fff",
        borderRadius: "8px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        padding: "24px 20px",
        marginBottom: "16px",
        display: "flex",
        alignItems: "center",
        gap: "16px",
      }}>
        <span style={{
          width: "48px",
          height: "48px",
          borderRadius: "12px",
          backgroundColor: tokens.successLight,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "22px",
          fontWeight: 700,
          color: tokens.success,
          flexShrink: 0,
        }}>
          医
        </span>
        <div>
          <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 600, color: tokens.textPrimary }}>
            {d.doctorName}
            <span style={{
              fontSize: "13px",
              fontWeight: 500,
              color: tokens.textSecondary,
              marginLeft: "10px",
              padding: "2px 8px",
              backgroundColor: tokens.bgPage,
              borderRadius: "4px",
            }}>
              {d.title}
            </span>
          </h2>
          <div style={{ fontSize: "13px", color: tokens.textSecondary, marginTop: "4px" }}>{d.hospitalName}</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "16px" }}>
        <StatCard label="患者总数" value={d.totalPatients ?? d.patientCount} color={tokens.primary} icon="患" />
        <StatCard label="今日预约" value={d.todayAppointments} color={tokens.success} icon="今" />
        <StatCard label="待处理预约" value={d.pendingAppointments} color={tokens.warning} icon="待" />
        <StatCard label="已完成预约" value={d.completedAppointments} color={tokens.danger} icon="完" />
      </div>

      <div style={{
        backgroundColor: "#fff",
        borderRadius: "8px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        padding: "20px",
      }}>
        <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", fontWeight: 600, color: tokens.textPrimary }}>
          月度预约趋势
        </h3>
        <div ref={chartRef} style={{ height: "400px", width: "100%" }} />
      </div>
    </div>
  );
}
