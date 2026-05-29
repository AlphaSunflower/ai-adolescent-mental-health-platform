"use client";

import { useState, useEffect, useCallback } from "react";
import { httpClient } from "@/lib/api-admin";

const s = {
  primary: "#409eff", text: "#303133", text2: "#606266", text3: "#909399",
  border: "#dcdfe6", bg: "#f0f2f5", white: "#fff", danger: "#f56c6c",
  success: "#67c23a", warning: "#e6a23c", radius: "4px", shadow: "0 2px 12px rgba(0,0,0,0.06)",
};

type PageResult<T> = { total: number; records: T[]; current: number; size: number; pages: number };

export function ProfileAudit() {
  const [data, setData] = useState<PageResult<Record<string,unknown>>>({ total:0, records:[], current:1, size:20, pages:0 });

  const fetchData = useCallback(async (page = 1) => {
    try {
      const res = await httpClient.get<PageResult<Record<string,unknown>>>("/admin/psychologist/audit/list", { query: { page, size: 20 } });
      setData(res);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleApprove = async (id: unknown) => {
    try { await httpClient.post(`/admin/psychologist/audit/${id}/approve`, {}); fetchData(); } catch { /* ignore */ }
  };

  const handleReject = async (id: unknown) => {
    const reason = prompt("请输入拒绝原因:");
    if (!reason) return;
    try { await httpClient.post(`/admin/psychologist/audit/${id}/reject`, { reason }); fetchData(); } catch { /* ignore */ }
  };

  return (
    <div style={{ padding:"20px", backgroundColor:s.bg, minHeight:"100%" }}>
      <div style={{ backgroundColor:s.white, borderRadius:"8px", boxShadow:s.shadow, padding:"20px" }}>
        <h3 style={{ margin:"0 0 20px", fontSize:"18px", color:s.text }}>咨询师资料审核</h3>
        <table style={{ width:"100%", borderCollapse:"collapse", border:"1px solid #ebeef5" }}>
          <thead>
            <tr style={{ backgroundColor:"#f5f7fa" }}>
              {["ID","姓名","申请时间","状态","操作"].map(h => <th key={h} style={{ padding:"12px 8px", textAlign:"left", fontSize:"13px", color:s.text3, fontWeight:600, borderBottom:"1px solid #ebeef5" }}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {data.records.map((row, i) => (
              <tr key={i} style={{ backgroundColor: i%2===0?"#fff":"#fafafa" }}>
                <td style={{ padding:"12px 8px", borderBottom:"1px solid #ebeef5", fontSize:"13px" }}>{row.id as string}</td>
                <td style={{ padding:"12px 8px", borderBottom:"1px solid #ebeef5", fontSize:"13px" }}>{row.realName as string}</td>
                <td style={{ padding:"12px 8px", borderBottom:"1px solid #ebeef5", fontSize:"13px" }}>{row.applyTime as string}</td>
                <td style={{ padding:"12px 8px", borderBottom:"1px solid #ebeef5", fontSize:"13px" }}>
                  <span style={{ color: (row.status as string)==="pending"?s.warning:(row.status as string)==="approved"?s.success:s.danger }}>
                    {(row.status as string)==="pending"?"待审核":(row.status as string)==="approved"?"已通过":"已拒绝"}
                  </span>
                </td>
                <td style={{ padding:"12px 8px", borderBottom:"1px solid #ebeef5" }}>
                  <button onClick={() => handleApprove(row.id)} style={{ color:s.success, border:"none", background:"none", cursor:"pointer", marginRight:"8px" }}>通过</button>
                  <button onClick={() => handleReject(row.id)} style={{ color:s.danger, border:"none", background:"none", cursor:"pointer" }}>拒绝</button>
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
    </div>
  );
}
