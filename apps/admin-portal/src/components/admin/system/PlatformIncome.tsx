"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { httpClient } from "@/lib/api-admin";
import * as echarts from "echarts";

import { s, tokens } from "@/lib/design-tokens";

function fmtMoney(n: unknown): string {
  const num = Number(n) || 0;
  if (num >= 10000) return (num / 10000).toFixed(2) + "万";
  return num.toFixed(2);
}

export function PlatformIncome() {
  const router = useRouter();
  const [stats, setStats] = useState<Record<string,unknown>>({});
  const trendRef = useRef<HTMLDivElement>(null);
  const pieRef = useRef<HTMLDivElement>(null);
  const trendChart = useRef<echarts.ECharts | null>(null);
  const pieChart = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      try {
        const statsRes = await httpClient.get<Record<string,unknown>>("/admin/platform-income/stats");
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - 29);
        const sd = start.toISOString().slice(0, 10);
        const ed = end.toISOString().slice(0, 10);
        const trend = await httpClient.get<Record<string,unknown>>("/admin/platform-income/trend", {
          query: { startDate: sd, endDate: ed, module: "CONSULTATION" },
        });
        if (cancelled || !trendRef.current || !pieRef.current) return;
        setStats(statsRes);

        const dates = trend.dates as string[] || [];
        const commissionData = (trend.commissionData as number[]) || [];
        const consultationData = (trend.consultationData as number[]) || [];
        const consult = (statsRes.consultation as Record<string,unknown>) || {};
        const member = (statsRes.member as Record<string,unknown>) || {};

        if (trendChart.current) trendChart.current.dispose();
        const tc = echarts.init(trendRef.current);
        tc.setOption({
          tooltip: { trigger: "axis" },
          legend: { data: ["平台抽成", "咨询流水"], textStyle: { color: "#666" } },
          grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
          xAxis: { type: "category", boundaryGap: false, data: dates },
          yAxis: { type: "value", axisLabel: { formatter: "¥{value}" } },
          series: [
            { name: "平台抽成", type: "line", smooth: true, data: commissionData, areaStyle: { color: "rgba(64,158,255,0.1)" }, itemStyle: { color: tokens.primary } },
            { name: "咨询流水", type: "line", smooth: true, data: consultationData, areaStyle: { color: "rgba(103,194,58,0.1)" }, itemStyle: { color: tokens.success } },
          ],
        });
        trendChart.current = tc;

        if (pieChart.current) pieChart.current.dispose();
        const pc = echarts.init(pieRef.current);
        pc.setOption({
          tooltip: { trigger: "item", formatter: "¥{c} ({d}%)" },
          legend: { orient: "vertical", left: "left", textStyle: { color: "#666" } },
          series: [{
            type: "pie", radius: ["40%", "70%"],
            itemStyle: { borderRadius: 8, borderColor: "#fff", borderWidth: 2 },
            label: { show: true, formatter: "¥{c}" },
            data: [
              { value: consult.platformCommission || 0, name: "心理咨询", itemStyle: { color: "#38ef7d" } },
              { value: member.platformCommission || 0, name: "会员收入", itemStyle: { color: "#764ba2" } },
            ],
          }],
        });
        pieChart.current = pc;
      } catch { /* ignore */ }
    };
    init();
    return () => { cancelled = true; trendChart.current?.dispose(); pieChart.current?.dispose(); };
  }, []);

  const consult = (stats.consultation as Record<string,unknown>) || {};
  const totalCommission = Number(stats.totalPlatformCommission || 0);
  const monthCommission = Number(stats.monthCommission || 0);

  return (
    <div style={{ padding:"20px", backgroundColor:s.bg, minHeight:"100%" }}>
      <h2 style={{ fontSize:"20px", fontWeight:600, color:s.text, margin:"0 0 20px" }}>平台收入统计</h2>

      {/* Module Cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))", gap:"16px", marginBottom:"20px" }}>
        {/* Consultation Card */}
        <div style={{ display:"flex", alignItems:"center", padding:"20px", background:s.white, borderRadius:"12px", boxShadow:s.shadow, border:"2px solid " + s.primary }}>
          <div style={{ width:"56px", height:"56px", borderRadius:"12px", background:"linear-gradient(135deg, #11998e, #38ef7d)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"28px", color:"#fff", marginRight:"16px", flexShrink:0 }}>💬</div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:"14px", color:s.text3, marginBottom:"4px" }}>心理咨询</div>
            <div style={{ fontSize:"22px", fontWeight:700, color:s.text }}>¥{fmtMoney(consult.platformCommission)}</div>
            <div style={{ fontSize:"12px", color:s.text3, marginTop:"2px" }}>{String(consult.orderCount || 0)} 笔订单</div>
          </div>
          <span style={{ fontSize:"12px", color:s.success, fontWeight:500, alignSelf:"flex-start" }}>已上线</span>
        </div>

        {/* Member Card */}
        <div style={{ display:"flex", alignItems:"center", padding:"20px", background:s.white, borderRadius:"12px", boxShadow:s.shadow, border:"2px solid transparent" }}>
          <div style={{ width:"56px", height:"56px", borderRadius:"12px", background:"linear-gradient(135deg, #667eea, #764ba2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"28px", color:"#fff", marginRight:"16px", flexShrink:0 }}>👤</div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:"14px", color:s.text3, marginBottom:"4px" }}>会员收入</div>
            <div style={{ fontSize:"22px", fontWeight:700, color:s.text }}>¥{fmtMoney(0)}</div>
            <div style={{ fontSize:"12px", color:s.text3, marginTop:"2px" }}>0 笔订单</div>
          </div>
          <span style={{ fontSize:"12px", color:s.text3, fontWeight:500, alignSelf:"flex-start" }}>预留</span>
        </div>

        {/* Total Card */}
        <div style={{ display:"flex", alignItems:"center", padding:"20px", background:"linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)", borderRadius:"12px", boxShadow:s.shadow }}>
          <div style={{ width:"100%", textAlign:"center" }}>
            <div style={{ fontSize:"14px", color:"rgba(255,255,255,0.7)", marginBottom:"8px" }}>平台总抽成</div>
            <div style={{ fontSize:"32px", fontWeight:800, color:"#fff", marginBottom:"4px" }}>¥{fmtMoney(totalCommission)}</div>
            <div style={{ fontSize:"13px", color:"rgba(255,255,255,0.6)" }}>本月 ¥{fmtMoney(monthCommission)}</div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:"20px", marginBottom:"20px" }}>
        <div style={{ background:s.white, borderRadius:"12px", boxShadow:s.shadow, padding:"16px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"12px" }}>
            <h3 style={{ fontSize:"16px", fontWeight:600, color:s.text, margin:0 }}>收入趋势</h3>
            <div style={{ display:"flex", gap:"16px", fontSize:"13px", color:"#666" }}>
              <span><span style={{ display:"inline-block", width:"10px", height:"10px", borderRadius:"50%", background:s.primary, marginRight:"4px" }} /> 平台抽成</span>
              <span><span style={{ display:"inline-block", width:"10px", height:"10px", borderRadius:"50%", background:s.success, marginRight:"4px" }} /> 咨询流水</span>
            </div>
          </div>
          <div ref={trendRef} style={{ height:"280px" }} />
        </div>
        <div style={{ background:s.white, borderRadius:"12px", boxShadow:s.shadow, padding:"16px" }}>
          <div style={{ marginBottom:"12px" }}>
            <h3 style={{ fontSize:"16px", fontWeight:600, color:s.text, margin:0 }}>收入构成</h3>
          </div>
          <div ref={pieRef} style={{ height:"280px" }} />
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ display:"flex", gap:"12px", background:s.white, padding:"16px", borderRadius:"12px", boxShadow:s.shadow }}>
        <button onClick={() => router.push("/admin/platform/consultation-income")} style={{ height:"36px", padding:"0 20px", backgroundColor:s.primary, color:"#fff", border:"none", borderRadius:s.radius, cursor:"pointer" }}>查看心理咨询收入明细</button>
        <button onClick={() => alert("评分0-1.5分：平台抽成60%  |  评分1.5-3分：平台抽成45%  |  评分3-4.5分：平台抽成30%  |  评分4.5-5分：平台抽成15%")} style={{ height:"36px", padding:"0 20px", border:`1px solid ${s.border}`, borderRadius:s.radius, background:s.white, cursor:"pointer" }}>抽成规则说明</button>
      </div>
    </div>
  );
}
