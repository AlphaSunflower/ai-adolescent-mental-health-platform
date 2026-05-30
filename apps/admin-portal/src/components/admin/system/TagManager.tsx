"use client";

import { useState, useEffect, useCallback } from "react";
import { httpClient } from "@/lib/api-admin";

const s = {
  primary: "#409eff", text: "#303133", text2: "#606266", text3: "#909399",
  border: "#dcdfe6", bg: "#f0f2f5", white: "#fff", danger: "#f56c6c",
  success: "#67c23a", warning: "#e6a23c", radius: "4px", shadow: "0 2px 12px rgba(0,0,0,0.06)",
};

type PageResult<T> = { total: number; records: T[]; current: number; size: number; pages: number };

export function TagManager() {
  const [data, setData] = useState<PageResult<Record<string,unknown>>>({ total:0, records:[], current:1, size:20, pages:0 });
  const [dialogVisible, setDialogVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<Record<string,unknown>|null>(null);
  const [currentItem, setCurrentItem] = useState<Record<string,unknown>|null>(null);
  const [form, setForm] = useState<Record<string,unknown>>({ name: "", code: "", sortOrder: "", status: 1 });

  const fetchData = useCallback(async () => {
    try {
      const list = await httpClient.get<Record<string,unknown>[]>("/article/tag/list");
      const arr = Array.isArray(list) ? list : [];
      arr.sort((a, b) => Number(a.id) - Number(b.id));
      setData({ total: arr.length, records: arr, current: 1, size: arr.length, pages: 1 });
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openAdd = () => { setEditingItem(null); setForm({ name: "", code: "", sortOrder: "", status: 1 }); setDialogVisible(true); };
  const openEdit = (item: Record<string,unknown>) => { setEditingItem(item); setForm({ name: item.name || "", code: item.code || "", sortOrder: item.sortOrder || "", status: (item.status as number) ?? 1 }); setDialogVisible(true); };
  const viewDetail = (item: Record<string,unknown>) => { setCurrentItem(item); setDetailVisible(true); };

  const handleToggleStatus = async (row: Record<string,unknown>) => {
    const newStatus = (row.status as number) === 1 ? 0 : 1;
    try {
      await httpClient.put(`/article/tag/${row.id}`, { ...row, status: newStatus });
      fetchData();
    } catch { /* ignore */ }
  };

  const handleSave = async () => {
    try {
      if (editingItem) {
        await httpClient.put(`/article/tag/${editingItem.id}`, form);
      } else {
        await httpClient.post("/article/tag", form);
      }
      setDialogVisible(false);
      fetchData();
    } catch { /* ignore */ }
  };

  const handleDelete = async (id: unknown) => {
    if (!confirm("确认删除？")) return;
    try { await httpClient.delete(`/article/tag/${id}`); fetchData(); } catch { /* ignore */ }
  };

  return (
    <div style={{ padding:"20px", backgroundColor:s.bg, minHeight:"100%" }}>
      <div style={{ backgroundColor:s.white, borderRadius:"8px", boxShadow:s.shadow, padding:"20px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"20px" }}>
          <h3 style={{ margin:0, fontSize:"18px", color:s.text }}>标签管理</h3>
          <button onClick={openAdd} style={{ height:"36px", padding:"0 20px", backgroundColor:s.primary, color:"#fff", border:"none", borderRadius:s.radius, cursor:"pointer" }}>新增标签</button>
        </div>
        <table style={{ width:"100%", borderCollapse:"collapse", border:"1px solid #ebeef5" }}>
          <thead>
            <tr style={{ backgroundColor:"#f5f7fa" }}>
              {["ID","标签名称","编码","排序","状态","创建时间","操作"].map(h => <th key={h} style={{ padding:"12px 8px", textAlign:"left", fontSize:"13px", color:s.text3, fontWeight:600, borderBottom:"1px solid #ebeef5" }}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {data.records.map((row, i) => (
              <tr key={i} style={{ backgroundColor: i%2===0?"#fff":"#fafafa" }}>
                <td style={{ padding:"12px 8px", borderBottom:"1px solid #ebeef5", fontSize:"13px" }}>{row.id as string}</td>
                <td style={{ padding:"12px 8px", borderBottom:"1px solid #ebeef5", fontSize:"13px" }}>{row.name as string}</td>
                <td style={{ padding:"12px 8px", borderBottom:"1px solid #ebeef5", fontSize:"13px" }}>{row.code as string}</td>
                <td style={{ padding:"12px 8px", borderBottom:"1px solid #ebeef5", fontSize:"13px" }}>{row.sortOrder as string}</td>
                <td style={{ padding:"12px 8px", borderBottom:"1px solid #ebeef5", fontSize:"13px" }}>
                  <span style={{ color: (row.status as number)===1?s.success:s.text3 }}>{(row.status as number)===1?"启用":"禁用"}</span>
                </td>
                <td style={{ padding:"12px 8px", borderBottom:"1px solid #ebeef5", fontSize:"13px" }}>{row.createTime as string}</td>
                <td style={{ padding:"12px 8px", borderBottom:"1px solid #ebeef5" }}>
                  <button onClick={() => viewDetail(row)} style={{ color:s.text2, border:"none", background:"none", cursor:"pointer", marginRight:"8px" }}>详情</button>
                  <button onClick={() => openEdit(row)} style={{ color:s.primary, border:"none", background:"none", cursor:"pointer", marginRight:"8px" }}>编辑</button>
                  <button onClick={() => handleToggleStatus(row)} style={{ color:s.warning, border:"none", background:"none", cursor:"pointer", marginRight:"8px" }}>{(row.status as number)===1?"禁用":"启用"}</button>
                  <button onClick={() => handleDelete(row.id)} style={{ color:s.danger, border:"none", background:"none", cursor:"pointer" }}>删除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ display:"flex", justifyContent:"flex-end", marginTop:"16px", gap:"8px", alignItems:"center" }}>
          <span style={{ fontSize:"13px", color:s.text2 }}>共 {data.total} 条</span>
        </div>
      </div>

      {/* Detail Dialog */}
      {detailVisible && currentItem && (
        <div style={{ position:"fixed", inset:0, backgroundColor:"rgba(0,0,0,0.5)", display:"flex", justifyContent:"center", alignItems:"center", zIndex:1000 }} onClick={() => setDetailVisible(false)}>
          <div style={{ backgroundColor:s.white, borderRadius:"8px", padding:"24px", width:"480px" }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin:"0 0 20px", fontSize:"18px", color:s.text }}>标签详情</h3>
            <div style={{ marginBottom:"12px" }}><span style={{ fontSize:"13px", color:s.text3 }}>ID：</span><span style={{ fontSize:"13px" }}>{currentItem.id as string}</span></div>
            <div style={{ marginBottom:"12px" }}><span style={{ fontSize:"13px", color:s.text3 }}>名称：</span><span style={{ fontSize:"13px" }}>{currentItem.name as string}</span></div>
            <div style={{ marginBottom:"12px" }}><span style={{ fontSize:"13px", color:s.text3 }}>编码：</span><span style={{ fontSize:"13px" }}>{currentItem.code as string}</span></div>
            <div style={{ marginBottom:"12px" }}><span style={{ fontSize:"13px", color:s.text3 }}>排序：</span><span style={{ fontSize:"13px" }}>{currentItem.sortOrder as string}</span></div>
            <div style={{ marginBottom:"12px" }}><span style={{ fontSize:"13px", color:s.text3 }}>状态：</span><span style={{ fontSize:"13px", color:(currentItem.status as number)===1?s.success:s.text3 }}>{(currentItem.status as number)===1?"启用":"禁用"}</span></div>
            <div style={{ marginBottom:"20px" }}><span style={{ fontSize:"13px", color:s.text3 }}>创建时间：</span><span style={{ fontSize:"13px" }}>{currentItem.createTime as string}</span></div>
            <div style={{ display:"flex", justifyContent:"flex-end" }}>
              <button onClick={() => setDetailVisible(false)} style={{ height:"36px", padding:"0 20px", border:`1px solid ${s.border}`, borderRadius:s.radius, background:s.white, cursor:"pointer" }}>关闭</button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Dialog */}
      {dialogVisible && (
        <div style={{ position:"fixed", inset:0, backgroundColor:"rgba(0,0,0,0.5)", display:"flex", justifyContent:"center", alignItems:"center", zIndex:1000 }} onClick={() => setDialogVisible(false)}>
          <div style={{ backgroundColor:s.white, borderRadius:"8px", padding:"24px", width:"480px" }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin:"0 0 20px", fontSize:"18px", color:s.text }}>{editingItem?"编辑标签":"新增标签"}</h3>
            <div style={{ marginBottom:"16px" }}><label style={{ display:"block", marginBottom:"6px", fontSize:"13px", color:s.text2 }}>标签名称</label><input value={form.name as string} onChange={(e) => setForm({...form, name:e.target.value})} style={{ width:"100%", height:"36px", padding:"0 12px", border:`1px solid ${s.border}`, borderRadius:s.radius, boxSizing:"border-box" }} /></div>
            <div style={{ marginBottom:"16px" }}><label style={{ display:"block", marginBottom:"6px", fontSize:"13px", color:s.text2 }}>编码</label><input value={form.code as string} onChange={(e) => setForm({...form, code:e.target.value})} style={{ width:"100%", height:"36px", padding:"0 12px", border:`1px solid ${s.border}`, borderRadius:s.radius, boxSizing:"border-box" }} /></div>
            <div style={{ marginBottom:"16px" }}><label style={{ display:"block", marginBottom:"6px", fontSize:"13px", color:s.text2 }}>排序</label><input value={form.sortOrder as string} onChange={(e) => setForm({...form, sortOrder:e.target.value})} style={{ width:"100%", height:"36px", padding:"0 12px", border:`1px solid ${s.border}`, borderRadius:s.radius, boxSizing:"border-box" }} /></div>
            <div style={{ marginBottom:"20px" }}><label style={{ display:"block", marginBottom:"6px", fontSize:"13px", color:s.text2 }}>状态</label><select value={form.status as number} onChange={(e) => setForm({...form, status: Number(e.target.value)})} style={{ width:"100%", height:"36px", padding:"0 12px", border:`1px solid ${s.border}`, borderRadius:s.radius }}><option value={1}>启用</option><option value={0}>禁用</option></select></div>
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
