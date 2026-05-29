"use client";

import { useState, useEffect, useCallback } from "react";
import { httpClient } from "@/lib/api-admin";

const s = {
  primary: "#409eff", text: "#303133", text2: "#606266", text3: "#909399",
  border: "#dcdfe6", bg: "#f0f2f5", white: "#fff", danger: "#f56c6c",
  success: "#67c23a", radius: "4px", shadow: "0 2px 12px rgba(0,0,0,0.06)",
};

type PageResult<T> = { total: number; records: T[]; current: number; size: number; pages: number };

export function FieldManager() {
  const [data, setData] = useState<PageResult<Record<string,unknown>>>({ total:0, records:[], current:1, size:20, pages:0 });
  const [dialogVisible, setDialogVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<Record<string,unknown>|null>(null);
  const [form, setForm] = useState<Record<string,unknown>>({ name: "" });

  const fetchData = useCallback(async (page = 1) => {
    try {
      const res = await httpClient.get<PageResult<Record<string,unknown>>>("/admin/psychologist/fields", { query: { page, size: 20 } });
      setData(res);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openAdd = () => { setEditingItem(null); setForm({ name: "" }); setDialogVisible(true); };
  const openEdit = (item: Record<string,unknown>) => { setEditingItem(item); setForm({ ...item }); setDialogVisible(true); };

  const handleSave = async () => {
    try {
      if (editingItem) {
        await httpClient.put(`/admin/psychologist/fields/${editingItem.id}`, form);
      } else {
        await httpClient.post("/admin/psychologist/fields", form);
      }
      setDialogVisible(false);
      fetchData();
    } catch { /* ignore */ }
  };

  const handleDelete = async (id: unknown) => {
    if (!confirm("确认删除？")) return;
    try { await httpClient.delete(`/admin/psychologist/fields/${id}`); fetchData(); } catch { /* ignore */ }
  };

  return (
    <div style={{ padding:"20px", backgroundColor:s.bg, minHeight:"100%" }}>
      <div style={{ backgroundColor:s.white, borderRadius:"8px", boxShadow:s.shadow, padding:"20px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"20px" }}>
          <h3 style={{ margin:0, fontSize:"18px", color:s.text }}>擅长领域管理</h3>
          <button onClick={openAdd} style={{ height:"36px", padding:"0 20px", backgroundColor:s.primary, color:"#fff", border:"none", borderRadius:s.radius, cursor:"pointer" }}>新增领域</button>
        </div>
        <table style={{ width:"100%", borderCollapse:"collapse", border:"1px solid #ebeef5" }}>
          <thead>
            <tr style={{ backgroundColor:"#f5f7fa" }}>
              {["ID","领域名称","操作"].map(h => <th key={h} style={{ padding:"12px 8px", textAlign:"left", fontSize:"13px", color:s.text3, fontWeight:600, borderBottom:"1px solid #ebeef5" }}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {data.records.map((row, i) => (
              <tr key={i} style={{ backgroundColor: i%2===0?"#fff":"#fafafa" }}>
                <td style={{ padding:"12px 8px", borderBottom:"1px solid #ebeef5", fontSize:"13px" }}>{row.id as string}</td>
                <td style={{ padding:"12px 8px", borderBottom:"1px solid #ebeef5", fontSize:"13px" }}>{row.name as string}</td>
                <td style={{ padding:"12px 8px", borderBottom:"1px solid #ebeef5" }}>
                  <button onClick={() => openEdit(row)} style={{ color:s.primary, border:"none", background:"none", cursor:"pointer", marginRight:"8px" }}>编辑</button>
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
      {dialogVisible && (
        <div style={{ position:"fixed", inset:0, backgroundColor:"rgba(0,0,0,0.5)", display:"flex", justifyContent:"center", alignItems:"center", zIndex:1000 }} onClick={() => setDialogVisible(false)}>
          <div style={{ backgroundColor:s.white, borderRadius:"8px", padding:"24px", width:"480px" }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin:"0 0 20px", fontSize:"18px", color:s.text }}>{editingItem?"编辑领域":"新增领域"}</h3>
            <div style={{ marginBottom:"20px" }}><label style={{ display:"block", marginBottom:"6px", fontSize:"13px", color:s.text2 }}>领域名称</label><input value={form.name as string} onChange={(e) => setForm({...form, name:e.target.value})} style={{ width:"100%", height:"36px", padding:"0 12px", border:`1px solid ${s.border}`, borderRadius:s.radius, boxSizing:"border-box" }} /></div>
            <div style={{ display:"flex", justifyContent:"flex-end", gap:"10px" }}>
              <button onClick={() => setDialogVisible(false)} style={{ height:"36px", padding:"0 20px", border:`1px solid ${s.border}`, borderRadius:s.radius, background:s.white, cursor:"pointer" }}>取消</button>
              <button onClick={handleSave} style={{ height:"36px", padding:"0 20px", backgroundColor:s.primary, color:"#fff", border:"none", borderRadius:s.radius, cursor:"pointer" }}>保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
