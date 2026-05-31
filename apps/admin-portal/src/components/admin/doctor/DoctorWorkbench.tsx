"use client";

import { httpClient } from "@/lib/api-admin";

const s = {
  primary: "#409eff", text: "#303133", text2: "#606266", text3: "#909399",
  white: "#fff", success: "#67c23a", warning: "#e6a23c", radius: "4px",
  shadow: "0 2px 12px rgba(0,0,0,0.06)",
};

export function DoctorWorkbench() {
  return (
    <div style={{ padding:"20px" }}>
      <h3 style={{ margin:"0 0 20px", fontSize:"18px", color:s.text }}>医生工作台</h3>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))", gap:"16px" }}>
        {[
          { title:"今日预约", value:"0", desc:"待处理" },
          { title:"待回复咨询", value:"0", desc:"未回复消息" },
          { title:"在诊患者", value:"0", desc:"当前在线" },
          { title:"本月接诊", value:"0", desc:"累计完成" },
        ].map((card, i) => (
          <div key={i} style={{ backgroundColor:s.white, borderRadius:s.radius, boxShadow:s.shadow, padding:"20px" }}>
            <div style={{ fontSize:"13px", color:s.text3, marginBottom:"8px" }}>{card.title}</div>
            <div style={{ fontSize:"28px", fontWeight:700, color:s.text, marginBottom:"4px" }}>{card.value}</div>
            <div style={{ fontSize:"12px", color:s.text2 }}>{card.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
