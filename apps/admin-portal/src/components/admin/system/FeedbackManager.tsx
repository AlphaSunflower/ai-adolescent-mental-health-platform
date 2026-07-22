"use client";

import { useState, useEffect, useCallback } from "react";
import { httpClient } from "@/lib/api-admin";

import { s } from "@/lib/design-tokens";

type PageResult<T> = { total: number; records: T[]; current: number; size: number; pages: number };

function getStatusLabel(st: number): string {
  const map: Record<number, string> = { 0: "待处理", 1: "待解决", 2: "已解决", 3: "已删除" };
  return map[st] ?? String(st);
}
function getStatusColor(st: number): string {
  if (st === 0) return s.warning; if (st === 1 || st === 2) return s.success; if (st === 3) return s.text3;
  return s.text3;
}

export function FeedbackManager() {
  const [data, setData] = useState<PageResult<Record<string,unknown>>>({ total:0, records:[], current:1, size:20, pages:0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (page = 1) => {
    setLoading(true); setError(null);
    try {
      const res = await httpClient.get<PageResult<Record<string,unknown>>>("/feedback/platform/list", { query: { page, size: 20 } });
      setData(res);
    } catch (err: unknown) { setError(err instanceof Error ? err.message : "加载反馈列表失败"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = async (id: unknown) => {
    if (!confirm("确认删除该反馈？")) return;
    try { await httpClient.put(`/feedback/platform/${id}/status`, { status: 3, cancelReason: "管理员删除" }); fetchData(); }
    catch { /* ignore */ }
  };

  const handleResolve = async (id: unknown) => {
    try { await httpClient.put(`/feedback/platform/${id}/status`, { status: 2 }); fetchData(); }
    catch { /* ignore */ }
  };

  return (
    <div style={{ padding:"20px", backgroundColor:s.bg, minHeight:"100%" }}>
      <div style={{ backgroundColor:s.white, borderRadius:"8px", boxShadow:s.shadow, padding:"20px" }}>
        <h3 style={{ margin:"0 0 20px", fontSize:"18px", color:s.text }}>反馈管理</h3>

        {error && (
          <div style={{ marginBottom:"16px", padding:"10px 16px", backgroundColor:"#fef0f0", color:s.danger, borderRadius:s.radius, fontSize:"13px" }}>
            {error}
            <button onClick={() => setError(null)} style={{ marginLeft:"12px", color:s.danger, border:"none", background:"none", cursor:"pointer" }}>关闭</button>
          </div>
        )}

        {loading ? (
          <div style={{ padding:"40px", textAlign:"center", color:s.text3 }}>加载中...</div>
        ) : (
          <>
            <table style={{ width:"100%", borderCollapse:"collapse", border:`1px solid ${s.border}` }}>
              <thead>
                <tr style={{ backgroundColor:s.bg }}>
                  {["ID","用户ID","反馈内容","状态","时间","操作"].map(h => <th key={h} style={{ padding:"12px 8px", textAlign:"left", fontSize:"13px", color:s.text3, fontWeight:600, borderBottom:`1px solid ${s.border}` }}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {data.records.length === 0 ? (
                  <tr><td colSpan={6} style={{ padding:"12px 8px", textAlign:"center", color:s.text3, fontSize:"13px", borderBottom:`1px solid ${s.border}` }}>暂无数据</td></tr>
                ) : (
                  data.records.map((row, i) => (
                    <tr key={i} style={{ backgroundColor: i%2===0?"#fff":s.bg }}>
                      <td style={{ padding:"12px 8px", borderBottom:`1px solid ${s.border}`, fontSize:"13px" }}>{row.id as string}</td>
                      <td style={{ padding:"12px 8px", borderBottom:`1px solid ${s.border}`, fontSize:"13px" }}>{row.userId as string}</td>
                      <td style={{ padding:"12px 8px", borderBottom:`1px solid ${s.border}`, fontSize:"13px", maxWidth:"300px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{row.content as string}</td>
                      <td style={{ padding:"12px 8px", borderBottom:`1px solid ${s.border}`, fontSize:"13px" }}>
                        <span style={{ display:"inline-block", padding:"2px 8px", borderRadius:s.radius, fontSize:"12px", fontWeight:500, color:getStatusColor(row.status as number), backgroundColor:getStatusColor(row.status as number)+"15" }}>
                          {getStatusLabel(row.status as number)}
                        </span>
                      </td>
                      <td style={{ padding:"12px 8px", borderBottom:`1px solid ${s.border}`, fontSize:"13px" }}>{row.createTime as string}</td>
                      <td style={{ padding:"12px 8px", borderBottom:`1px solid ${s.border}` }}>
                        {(row.status as number) !== 3 && (
                          <>
                            <button onClick={() => handleResolve(row.id)} style={{ color:s.primary, border:"none", background:"none", cursor:"pointer", marginRight:"8px" }}>解决</button>
                            <button onClick={() => handleDelete(row.id)} style={{ color:s.danger, border:"none", background:"none", cursor:"pointer" }}>删除</button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <div style={{ display:"flex", justifyContent:"flex-end", marginTop:"16px", gap:"8px", alignItems:"center" }}>
              <span style={{ fontSize:"13px", color:s.text2 }}>共 {data.total} 条</span>
              <button onClick={() => fetchData(data.current-1)} disabled={data.current<=1} style={{ padding:"6px 12px", border:`1px solid ${s.border}`, borderRadius:s.radius, background:s.white, cursor:"pointer" }}>上一页</button>
              <span style={{ fontSize:"13px", color:s.text2 }}>{data.current} / {data.pages||1}</span>
              <button onClick={() => fetchData(data.current+1)} disabled={data.current>=data.pages} style={{ padding:"6px 12px", border:`1px solid ${s.border}`, borderRadius:s.radius, background:s.white, cursor:"pointer" }}>下一页</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
