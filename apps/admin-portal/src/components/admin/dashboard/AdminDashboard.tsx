"use client";

import { useState, useEffect, useRef } from "react";
import * as echarts from "echarts";
import { httpClient } from "@/lib/api-admin";
import { tokens } from "@/lib/design-tokens";

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
  icon: string;
  variant?: "primary" | "success" | "warning" | "danger";
}

function statColors(variant: StatCardProps["variant"] = "primary") {
  const map = {
    primary: { color: tokens.primary, bg: tokens.primaryLight },
    success: { color: tokens.success, bg: tokens.successLight },
    warning: { color: tokens.warning, bg: tokens.warningLight },
    danger:  { color: tokens.danger,  bg: tokens.dangerLight },
  };
  return map[variant];
}

function StatCard({ label, value, icon, variant = "primary" }: StatCardProps) {
  const { color, bg } = statColors(variant);
  return (
    <div style={{
      backgroundColor: tokens.bgCard,
      borderRadius: tokens.radiusLg,
      boxShadow: tokens.shadowSm,
      padding: "20px 24px",
      display: "flex",
      alignItems: "center",
      gap: "16px",
      border: `1px solid ${tokens.borderLight}`,
      transition: "box-shadow 0.2s",
    }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = tokens.shadowMd; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = tokens.shadowSm; }}
    >
      <span style={{
        width: "48px",
        height: "48px",
        borderRadius: tokens.radiusMd,
        backgroundColor: bg,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "18px",
        fontWeight: 700,
        color,
        flexShrink: 0,
        lineHeight: 1,
      }}>
        {icon}
      </span>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: tokens.fontSizeSm, color: tokens.textSecondary, marginBottom: "2px" }}>{label}</div>
        <div style={{ fontSize: tokens.fontSize2xl, fontWeight: 700, color: tokens.textPrimary, lineHeight: 1.2, letterSpacing: "-0.5px" }}>
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
        setError(err instanceof Error ? err.message : "Unknown error");
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
      tooltip: {
        trigger: "axis",
        backgroundColor: tokens.bgCard,
        borderColor: tokens.border,
        textStyle: { color: tokens.textPrimary, fontSize: 12 },
      },
      grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
      xAxis: {
        type: "category",
        data: labels,
        boundaryGap: false,
        axisLine: { lineStyle: { color: tokens.border } },
        axisTick: { show: false },
        axisLabel: { color: tokens.textSecondary, fontSize: 11 },
      },
      yAxis: {
        type: "value",
        minInterval: 1,
        splitLine: { lineStyle: { color: tokens.borderLight } },
        axisLabel: { color: tokens.textSecondary, fontSize: 11 },
      },
      series: [
        {
          name: "咨询量",
          type: "line",
          data: consultationData,
          smooth: true,
          symbol: "circle",
          symbolSize: 6,
          lineStyle: { color: tokens.primary, width: 2.5 },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: "rgba(59,125,125,0.25)" },
              { offset: 1, color: "rgba(59,125,125,0.02)" },
            ]),
          },
          itemStyle: { color: tokens.primary },
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
    return <div style={{ padding: tokens.spacing3xl, textAlign: "center", color: tokens.textSecondary }}>加载中...</div>;
  }

  if (error || !data) {
    return (
      <div style={{ padding: tokens.spacing3xl, textAlign: "center" }}>
        <div style={{ color: tokens.danger, marginBottom: tokens.spacingMd }}>数据加载失败: {error ?? "未知错误"}</div>
        <button onClick={() => window.location.reload()} style={{
          padding: "6px 20px",
          border: `1px solid ${tokens.border}`,
          borderRadius: tokens.radiusSm,
          background: tokens.bgCard,
          color: tokens.primary,
          cursor: "pointer",
          fontSize: tokens.fontSizeSm,
        }}>
          重试
        </button>
      </div>
    );
  }

  const d = data;

  return (
    <div>
      <div style={{ marginBottom: tokens.spacingXl }}>
        <h2 style={{ margin: 0, fontSize: tokens.fontSizeXl, fontWeight: 700, color: tokens.textPrimary }}>
          工作概览
        </h2>
        <p style={{ margin: "4px 0 0", fontSize: tokens.fontSizeSm, color: tokens.textSecondary }}>
          平台核心数据一览
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: tokens.spacingBase, marginBottom: tokens.spacingBase }}>
        <StatCard label="用户总数"   value={d.totalUsers}          icon="用" variant="primary" />
        <StatCard label="本月新增"   value={d.monthlyNewUsers}      icon="新" variant="success" />
        <StatCard label="医院数量"   value={d.totalHospitals}       icon="院" variant="warning" />
        <StatCard label="咨询师"     value={d.totalPsychologists ?? 0} icon="咨" variant="danger" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: tokens.spacingBase, marginBottom: tokens.spacingBase }}>
        <StatCard label="文章总数" value={d.totalArticles}     icon="文" variant="primary" />
        <StatCard label="测评总数" value={d.totalAssessments}  icon="测" variant="success" />
      </div>

      <div style={{
        backgroundColor: tokens.bgCard,
        borderRadius: tokens.radiusLg,
        boxShadow: tokens.shadowSm,
        padding: tokens.spacingXl,
        border: `1px solid ${tokens.borderLight}`,
      }}>
        <h3 style={{ margin: `0 0 ${tokens.spacingBase} 0`, fontSize: tokens.fontSizeLg, fontWeight: 600, color: tokens.textPrimary }}>
          月度咨询趋势
        </h3>
        <div ref={chartRef} style={{ height: "360px", width: "100%" }} />
      </div>
    </div>
  );
}
