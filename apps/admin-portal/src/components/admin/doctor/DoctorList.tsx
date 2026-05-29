"use client";

import { useState, useEffect, useCallback } from "react";
import { httpClient } from "@/lib/api-admin";

const s = {
  primary: "#409eff", text: "#303133", text2: "#606266", text3: "#909399",
  border: "#dcdfe6", bg: "#f0f2f5", white: "#fff", danger: "#f56c6c",
  success: "#67c23a", radius: "4px", shadow: "0 2px 12px rgba(0,0,0,0.06)",
};

type PageResult<T> = { total: number; records: T[]; current: number; size: number; pages: number };

export function DoctorList() {
  const [data, setData] = useState<PageResult<Record<string,unknown>>>({ total:0, records:[], current:1, size:20, pages:0 });
  const [search, setSearch] = useState("");
  const [dialogVisible, setDialogVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<Record<string,unknown>|null>(null);
  const [form, setForm] = useState<Record<string,unknown>>({ realName: "", title: "", departmentId: null, introduction: "", consultationEnabled: false });

  const fetchData = useCallback(async (page = 1) => {
    try {
      const res = await httpClient.get<PageResult<Record<string,unknown>>>("/admin/hospital/doctors", { query: { page, size: 20, keyword: search } });
      setData(res);
    } catch { /* ignore */ }
  }, [search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openAdd = () => { setEditingItem(null); setForm({ realName: "", title: "", departmentId: null, introduction: "", consultationEnabled: false }); setDialogVisible(true); };
  const openEdit = (item: Record<string,unknown>) => { setEditingItem(item); setForm({ ...item }); setDialogVisible(true); };

  const handleSave = async () => {
    try {
      if (editingItem) {
        await httpClient.post("/admin/hospital/doctor", { id: editingItem.id, ...form });
      } else {
        await httpClient.post("/admin/hospital/doctor", form);
      }
      setDialogVisible(false);
      fetchData();
    } catch { /* ignore */ }
  };

  const handleDelete = async (id: unknown) => {
    if (!confirm("确认删除？")) return;
    try { await httpClient.delete(`/admin/hospital/doctor/${id}`); fetchData(); } catch { /* ignore */ }
  };

  return (
    <div style={{ padding:"20px", backgroundColor:s.bg, minHeight:"100%" }}>
      <div style={{ backgroundColor:s.white, borderRadius:"8px", boxShadow:s.shadow, padding:"20px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"20px" }}>
          <div style={{ display:"flex", gap:"10px" }}>
            <input placeholder="搜索医生..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key==="Enter"&&fetchData()}
              style={{ height:"36px", padding:"0 12px", border:`1px solid ${s.border}`, borderRadius:s.radius, width:"240px", outline:"none" }} />
            <button onClick={() => fetchData()} style={{ height:"36px", padding:"0 20px", backgroundColor:s.primary, color:"#fff", border:"none", borderRadius:s.radius, cursor:"pointer" }}>搜索</button>
          </div>
          <button onClick={openAdd} style={{ height:"36px", padding:"0 20px", backgroundColor:s.primary, color:"#fff", border:"none", borderRadius:s.radius, cursor:"pointer" }}>新增医生</button>
        </div>
        <table style={{ width:"100%", borderCollapse:"collapse", border:"1px solid #ebeef5" }}>
          <thead>
            <tr style={{ backgroundColor:"#f5f7fa" }}>
              {["ID","姓名","职称","科室","咨询开关","操作"].map(h => <th key={h} style={{ padding:"12px 8px", textAlign:"left", fontSize:"13px", color:s.text3, fontWeight:600, borderBottom:"1px solid #ebeef5" }}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {data.records.map((row, i) => (
              <tr key={i} style={{ backgroundColor: i%2===0?"#fff":"#fafafa" }}>
                <td style={{ padding:"12px 8px", borderBottom:"1px solid #ebeef5", fontSize:"13px" }}>{row.id as string}</td>
                <td style={{ padding:"12px 8px", borderBottom:"1px solid #ebeef5", fontSize:"13px" }}>{row.realName as string}</td>
                <td style={{ padding:"12px 8px", borderBottom:"1px solid #ebeef5", fontSize:"13px" }}>{row.title as string}</td>
                <td style={{ padding:"12px 8px", borderBottom:"1px solid #ebeef5", fontSize:"13px" }}>{row.departmentName as string}</td>
                <td style={{ padding:"12px 8px", borderBottom:"1px solid #ebeef5", fontSize:"13px" }}>
                  <span style={{ color: row.consultationEnabled?s.success:s.text3 }}>{row.consultationEnabled?"开启":"关闭"}</span>
                </td>
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
          <div style={{ backgroundColor:s.white, borderRadius:"8px", padding:"24px", width:"480px", maxHeight:"80vh", overflow:"auto" }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin:"0 0 20px", fontSize:"18px", color:s.text }}>{editingItem?"编辑医生":"新增医生"}</h3>
            <div style={{ marginBottom:"16px" }}><label style={{ display:"block", marginBottom:"6px", fontSize:"13px", color:s.text2 }}>姓名</label><input value={form.realName as string} onChange={(e) => setForm({...form, realName:e.target.value})} style={{ width:"100%", height:"36px", padding:"0 12px", border:`1px solid ${s.border}`, borderRadius:s.radius, boxSizing:"border-box" }} /></div>
            <div style={{ marginBottom:"16px" }}><label style={{ display:"block", marginBottom:"6px", fontSize:"13px", color:s.text2 }}>职称</label><input value={form.title as string} onChange={(e) => setForm({...form, title:e.target.value})} style={{ width:"100%", height:"36px", padding:"0 12px", border:`1px solid ${s.border}`, borderRadius:s.radius, boxSizing:"border-box" }} /></div>
            <div style={{ marginBottom:"16px" }}><label style={{ display:"block", marginBottom:"6px", fontSize:"13px", color:s.text2 }}>科室ID</label><input value={form.departmentId as string} onChange={(e) => setForm({...form, departmentId:e.target.value})} style={{ width:"100%", height:"36px", padding:"0 12px", border:`1px solid ${s.border}`, borderRadius:s.radius, boxSizing:"border-box" }} /></div>
            <div style={{ marginBottom:"16px" }}><label style={{ display:"block", marginBottom:"6px", fontSize:"13px", color:s.text2 }}>简介</label><textarea value={form.introduction as string} onChange={(e) => setForm({...form, introduction:e.target.value})} rows={3} style={{ width:"100%", padding:"8px 12px", border:`1px solid ${s.border}`, borderRadius:s.radius, boxSizing:"border-box", resize:"vertical" }} /></div>
            <div style={{ marginBottom:"20px" }}><label style={{ display:"flex", alignItems:"center", gap:"8px", fontSize:"13px", color:s.text2, cursor:"pointer" }}><input type="checkbox" checked={form.consultationEnabled as boolean} onChange={(e) => setForm({...form, consultationEnabled:e.target.checked})} />开启在线咨询</label></div>
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
