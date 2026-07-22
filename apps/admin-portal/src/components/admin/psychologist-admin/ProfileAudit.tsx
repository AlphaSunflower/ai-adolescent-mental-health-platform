"use client";

import { useState, useEffect, useCallback } from "react";
import { httpClient } from "@/lib/api-admin";

import { s } from "@/lib/design-tokens";

type PageResult<T> = { total: number; records: T[]; current: number; size: number; pages: number };

function getStatusLabel(status: number) {
  if (status === 0) return "待审核";
  if (status === 1) return "已通过";
  if (status === 2) return "已拒绝";
  return "未知";
}

function getStatusColor(status: number) {
  if (status === 0) return s.warning;
  if (status === 1) return s.success;
  if (status === 2) return s.danger;
  return s.text3;
}

export function ProfileAudit() {
  const [data, setData] = useState<PageResult<Record<string,unknown>>>({ total:0, records:[], current:1, size:20, pages:0 });
  const [auditVisible, setAuditVisible] = useState(false);
  const [auditingItem, setAuditingItem] = useState<Record<string,unknown>|null>(null);
  const [auditAction, setAuditAction] = useState<"approve"|"reject">("approve");
  const [auditRemark, setAuditRemark] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const fetchData = useCallback(async (page = 1) => {
    try {
      const query: Record<string, string | number | boolean | null | undefined> = { page, size: 20 };
      if (statusFilter !== "") query.status = Number(statusFilter);
      const res = await httpClient.get<PageResult<Record<string,unknown>>>("/admin/psychologist/audit/list", { query });
      setData(res);
    } catch { /* ignore */ }
  }, [statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openAudit = (row: Record<string,unknown>, action: "approve"|"reject") => {
    setAuditingItem(row);
    setAuditAction(action);
    setAuditRemark("");
    setAuditVisible(true);
  };

  const confirmAudit = async () => {
    if (!auditingItem) return;
    if (auditAction === "reject" && !auditRemark) return;
    try {
      await httpClient.post(`/admin/psychologist/audit/${auditingItem.id}/${auditAction}`, {}, { query: { remark: auditRemark || undefined } });
      setAuditVisible(false);
      fetchData();
    } catch { /* ignore */ }
  };

  return (
    <div style={{ padding:"20px", backgroundColor:s.bg, minHeight:"100%" }}>
      <div style={{ backgroundColor:s.white, borderRadius:"8px", boxShadow:s.shadow, padding:"20px" }}>
        <h3 style={{ margin:"0 0 20px", fontSize:"18px", color:s.text }}>咨询师资料审核</h3>
        <div style={{ display:"flex", gap:"10px", marginBottom:"16px" }}>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            style={{ height:"36px", padding:"0 8px", border:`1px solid ${s.border}`, borderRadius:s.radius, fontSize:"13px", color:s.text2 }}>
            <option value="">全部状态</option>
            <option value="0">待审核</option>
            <option value="1">已通过</option>
            <option value="2">已拒绝</option>
          </select>
        </div>
        <table style={{ width:"100%", borderCollapse:"collapse", border:`1px solid ${s.border}` }}>
          <thead>
            <tr style={{ backgroundColor:s.bg }}>
              {["ID","咨询师","变更字段","变更内容","审核状态","申请时间","操作"].map(h => <th key={h} style={{ padding:"12px 8px", textAlign:"left", fontSize:"13px", color:s.text3, fontWeight:600, borderBottom:`1px solid ${s.border}` }}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {data.records.map((row, i) => (
              <tr key={i} style={{ backgroundColor: i%2===0?"#fff":s.bg }}>
                <td style={{ padding:"12px 8px", borderBottom:`1px solid ${s.border}`, fontSize:"13px" }}>{row.id as string}</td>
                <td style={{ padding:"12px 8px", borderBottom:`1px solid ${s.border}`, fontSize:"13px" }}>{row.psychologistName as string}</td>
                <td style={{ padding:"12px 8px", borderBottom:`1px solid ${s.border}`, fontSize:"13px" }}>
                  <span style={{ display:"inline-block", padding:"2px 8px", background:s.bg, borderRadius:"10px", fontSize:"12px", color:s.text2 }}>{row.fieldNameText as string || row.fieldName as string}</span>
                </td>
                <td style={{ padding:"12px 8px", borderBottom:`1px solid ${s.border}`, fontSize:"13px" }}>
                  <div><span style={{ color:s.text3, fontSize:"12px" }}>原值：</span><span style={{ textDecoration:"line-through", color:s.text3 }}>{row.oldValue as string || "(空)"}</span></div>
                  <div><span style={{ color:s.text3, fontSize:"12px" }}>新值：</span><span style={{ color:s.primary, fontWeight:500 }}>{row.newValue as string || "(空)"}</span></div>
                </td>
                <td style={{ padding:"12px 8px", borderBottom:`1px solid ${s.border}`, fontSize:"13px" }}>
                  <span style={{ color: getStatusColor(row.auditStatus as number) }}>{row.auditStatusText as string || getStatusLabel(row.auditStatus as number)}</span>
                </td>
                <td style={{ padding:"12px 8px", borderBottom:`1px solid ${s.border}`, fontSize:"13px" }}>{row.createTime as string}</td>
                <td style={{ padding:"12px 8px", borderBottom:`1px solid ${s.border}` }}>
                  {(row.auditStatus as number) === 0 && (
                    <>
                      <button onClick={() => openAudit(row, "approve")} style={{ color:s.success, border:"none", background:"none", cursor:"pointer", marginRight:"8px" }}>通过</button>
                      <button onClick={() => openAudit(row, "reject")} style={{ color:s.danger, border:"none", background:"none", cursor:"pointer" }}>拒绝</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ display:"flex", justifyContent:"flex-end", marginTop:"16px", gap:"8px", alignItems:"center" }}>
          <span style={{ fontSize:"13px", color:s.text2 }}>共 {data.total} 条</span>
          <button onClick={() => fetchData(data.current-1)} disabled={data.current<=1} style={{ padding:"6px 12px", border:`1px solid ${s.border}`, borderRadius:s.radius, background:s.white, cursor:"pointer" }}>上一页</button>
          <span style={{ fontSize:"13px", color:s.text2 }}>{data.current} / {data.pages||1}</span>
          <button onClick={() => fetchData(data.current+1)} disabled={data.current>=data.pages} style={{ padding:"6px 12px", border:`1px solid ${s.border}`, borderRadius:s.radius, background:s.white, cursor:"pointer" }}>下一页</button>
        </div>
      </div>

      {/* Audit Dialog */}
      {auditVisible && (
        <div style={{ position:"fixed", inset:0, backgroundColor:"rgba(0,0,0,0.5)", display:"flex", justifyContent:"center", alignItems:"center", zIndex:1000 }} onClick={() => setAuditVisible(false)}>
          <div style={{ backgroundColor:s.white, borderRadius:"8px", padding:"24px", width:"500px" }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin:"0 0 20px", fontSize:"18px", color:s.text }}>{auditAction === "approve" ? "通过审核" : "拒绝审核"}</h3>
            <div style={{ marginBottom:"20px" }}>
              <label style={{ display:"block", marginBottom:"6px", fontSize:"13px", color:s.text2 }}>{auditAction === "approve" ? "审核备注（可选）" : "拒绝原因"}</label>
              <textarea value={auditRemark} onChange={(e) => setAuditRemark(e.target.value)} rows={3} placeholder={auditAction === "approve" ? "可选：添加通过备注" : "请输入拒绝原因"} style={{ width:"100%", padding:"8px 12px", border:`1px solid ${s.border}`, borderRadius:s.radius, boxSizing:"border-box", resize:"vertical" }} />
            </div>
            <div style={{ display:"flex", justifyContent:"flex-end", gap:"10px" }}>
              <button onClick={() => setAuditVisible(false)} style={{ height:"36px", padding:"0 20px", border:`1px solid ${s.border}`, borderRadius:s.radius, background:s.white, cursor:"pointer" }}>取消</button>
              <button onClick={confirmAudit} style={{ height:"36px", padding:"0 20px", backgroundColor: auditAction==="approve"?s.primary:s.danger, color:"#fff", border:"none", borderRadius:s.radius, cursor:"pointer" }}>确认{auditAction==="approve"?"通过":"拒绝"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
