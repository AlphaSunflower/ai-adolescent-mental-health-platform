"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { httpClient } from "@/lib/api-admin";

import { s } from "@/lib/design-tokens";

type PageResult<T> = { total: number; records: T[]; current: number; size: number; pages: number };

export function CourseManager() {
  const [data, setData] = useState<PageResult<Record<string,unknown>>>({ total:0, records:[], current:1, size:20, pages:0 });
  const [search, setSearch] = useState("");
  const router = useRouter();

  const fetchData = useCallback(async (page = 1) => {
    try {
      const res = await httpClient.get<PageResult<Record<string,unknown>>>("/content/admin/courses", { query: { page, size: 20, keyword: search } });
      setData(res);
    } catch { /* ignore */ }
  }, [search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = async (id: unknown) => {
    if (!confirm("确认删除？")) return;
    try { await httpClient.delete(`/content/course/${id}`); fetchData(); } catch { /* ignore */ }
  };

  return (
    <div style={{ padding:"20px", backgroundColor:s.bg, minHeight:"100%" }}>
      <div style={{ backgroundColor:s.white, borderRadius:"8px", boxShadow:s.shadow, padding:"20px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"20px" }}>
          <div style={{ display:"flex", gap:"10px" }}>
            <input placeholder="搜索课程..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key==="Enter"&&fetchData()}
              style={{ height:"36px", padding:"0 12px", border:`1px solid ${s.border}`, borderRadius:s.radius, width:"240px", outline:"none" }} />
            <button onClick={() => fetchData()} style={{ height:"36px", padding:"0 20px", backgroundColor:s.primary, color:"#fff", border:"none", borderRadius:s.radius, cursor:"pointer" }}>搜索</button>
          </div>
          <button onClick={() => router.push("/admin/content/courses/new")} style={{ height:"36px", padding:"0 20px", backgroundColor:s.primary, color:"#fff", border:"none", borderRadius:s.radius, cursor:"pointer" }}>新增课程</button>
        </div>
        <table style={{ width:"100%", borderCollapse:"collapse", border:`1px solid ${s.border}` }}>
          <thead>
            <tr style={{ backgroundColor:s.bg }}>
              {["ID","课程名称","讲师","章节数","学习人数","创建时间","操作"].map(h => <th key={h} style={{ padding:"12px 8px", textAlign:"left", fontSize:"13px", color:s.text3, fontWeight:600, borderBottom:`1px solid ${s.border}` }}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {data.records.map((row, i) => (
              <tr key={i} style={{ backgroundColor: i%2===0?"#fff":s.bg }}>
                <td style={{ padding:"12px 8px", borderBottom:`1px solid ${s.border}`, fontSize:"13px" }}>{row.id as string}</td>
                <td style={{ padding:"12px 8px", borderBottom:`1px solid ${s.border}`, fontSize:"13px" }}>{row.title as string}</td>
                <td style={{ padding:"12px 8px", borderBottom:`1px solid ${s.border}`, fontSize:"13px" }}>{row.instructor as string}</td>
                <td style={{ padding:"12px 8px", borderBottom:`1px solid ${s.border}`, fontSize:"13px" }}>{row.chapterCount as string}</td>
                <td style={{ padding:"12px 8px", borderBottom:`1px solid ${s.border}`, fontSize:"13px" }}>{row.enrollCount as string}</td>
                <td style={{ padding:"12px 8px", borderBottom:`1px solid ${s.border}`, fontSize:"13px" }}>{row.createTime as string}</td>
                <td style={{ padding:"12px 8px", borderBottom:`1px solid ${s.border}` }}>
                  <button onClick={() => router.push(`/admin/content/courses/${row.id}/edit`)} style={{ color:s.primary, border:"none", background:"none", cursor:"pointer", marginRight:"8px" }}>编辑</button>
                  <button onClick={() => handleDelete(row.id)} style={{ color:s.danger, border:"none", background:"none", cursor:"pointer" }}>删除</button>
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
