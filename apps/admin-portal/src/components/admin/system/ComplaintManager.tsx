"use client";

import { useState, useEffect, useCallback } from "react";
import { httpClient } from "@/lib/api-admin";

import { s } from "@/lib/design-tokens";

type PageResult<T> = { total: number; records: T[]; current: number; size: number; pages: number };

export function ComplaintManager() {
  const [data, setData] = useState<PageResult<Record<string,unknown>>>({ total:0, records:[], current:1, size:20, pages:0 });

  const fetchData = useCallback(async (page = 1) => {
    try {
      const res = await httpClient.get<PageResult<Record<string,unknown>>>("/complaint/list", { query: { page, size: 20 } });
      setData(res);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleResolve = async (id: unknown) => {
    try { await httpClient.post(`/complaint/audit/${id}`, null, { query: { status: 1 } }); fetchData(); } catch { /* ignore */ }
  };

  const handleReject = async (id: unknown) => {
    try { await httpClient.post(`/complaint/audit/${id}`, null, { query: { status: 2 } }); fetchData(); } catch { /* ignore */ }
  };

  return (
    <div style={{ padding:"20px", backgroundColor:s.bg, minHeight:"100%" }}>
      <div style={{ backgroundColor:s.white, borderRadius:"8px", boxShadow:s.shadow, padding:"20px" }}>
        <h3 style={{ margin:"0 0 20px", fontSize:"18px", color:s.text }}>投诉审核</h3>
        <table style={{ width:"100%", borderCollapse:"collapse", border:`1px solid ${s.border}` }}>
          <thead>
            <tr style={{ backgroundColor:s.bg }}>
              {["ID","投诉人","投诉对象","内容","时间","状态","操作"].map(h => <th key={h} style={{ padding:"12px 8px", textAlign:"left", fontSize:"13px", color:s.text3, fontWeight:600, borderBottom:`1px solid ${s.border}` }}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {data.records.map((row, i) => (
              <tr key={i} style={{ backgroundColor: i%2===0?"#fff":s.bg }}>
                <td style={{ padding:"12px 8px", borderBottom:`1px solid ${s.border}`, fontSize:"13px" }}>{row.id as string}</td>
                <td style={{ padding:"12px 8px", borderBottom:`1px solid ${s.border}`, fontSize:"13px" }}>{row.complainant as string}</td>
                <td style={{ padding:"12px 8px", borderBottom:`1px solid ${s.border}`, fontSize:"13px" }}>{row.target as string}</td>
                <td style={{ padding:"12px 8px", borderBottom:`1px solid ${s.border}`, fontSize:"13px", maxWidth:"200px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{row.content as string}</td>
                <td style={{ padding:"12px 8px", borderBottom:`1px solid ${s.border}`, fontSize:"13px" }}>{row.createTime as string}</td>
                <td style={{ padding:"12px 8px", borderBottom:`1px solid ${s.border}`, fontSize:"13px" }}>
                  <span style={{ color: (row.status as string)==="pending"?s.warning:(row.status as string)==="resolved"?s.success:s.danger }}>
                    {(row.status as string)==="pending"?"待审核":(row.status as string)==="resolved"?"已处理":"已驳回"}
                  </span>
                </td>
                <td style={{ padding:"12px 8px", borderBottom:`1px solid ${s.border}` }}>
                  <button onClick={() => handleResolve(row.id)} style={{ color:s.success, border:"none", background:"none", cursor:"pointer", marginRight:"8px" }}>通过</button>
                  <button onClick={() => handleReject(row.id)} style={{ color:s.danger, border:"none", background:"none", cursor:"pointer" }}>驳回</button>
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
