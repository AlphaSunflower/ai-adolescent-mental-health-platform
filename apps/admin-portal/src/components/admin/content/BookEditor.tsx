"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { httpClient } from "@/lib/api-admin";

const s = { primary: "#409eff", text: "#303133", text2: "#606266", text3: "#909399", border: "#dcdfe6", bg: "#f0f2f5", white: "#fff", radius: "4px" };

export function BookEditor() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string | undefined;
  const isEdit = !!id;
  const [form, setForm] = useState({ title: "", coverUrl: "", description: "", address: "", sortOrder: 0, status: 1 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      setLoading(true);
      httpClient.get<Record<string,unknown>>("/admin/book/" + id).then((data) => setForm({
        title: (data.title as string) || "",
        coverUrl: (data.coverUrl as string) || "",
        description: (data.description as string) || "",
        address: (data.address as string) || "",
        sortOrder: (data.sortOrder as number) || 0,
        status: (data.status as number) ?? 1,
      })).catch(() => {}).finally(() => setLoading(false));
    }
  }, [id]);

  const handleSave = async () => {
    if (!form.title.trim()) { alert("请输入书名"); return; }
    try {
      if (isEdit) {
        await httpClient.put("/admin/book/" + id, form);
      } else {
        await httpClient.post("/admin/book", form);
      }
      router.push("/admin/content/books");
    } catch { alert("保存失败"); }
  };

  if (loading) return <div style={{ padding:"40px", textAlign:"center", color:s.text3 }}>加载中...</div>;

  return (
    <div style={{ padding:"20px", backgroundColor:s.bg, minHeight:"100%" }}>
      <div style={{ backgroundColor:s.white, borderRadius:"8px", boxShadow:"0 2px 12px rgba(0,0,0,0.06)", padding:"20px", maxWidth:"700px" }}>
        <h3 style={{ margin:"0 0 20px", fontSize:"18px", color:s.text }}>{isEdit ? "编辑书籍" : "新增书籍"}</h3>
        <div style={{ marginBottom:"16px" }}><label style={{ display:"block", marginBottom:"6px", fontSize:"13px", color:s.text2 }}>书名</label><input value={form.title} onChange={(e) => setForm({...form, title:e.target.value})} style={{ width:"100%", height:"36px", padding:"0 12px", border:"1px solid " + s.border, borderRadius:s.radius, boxSizing:"border-box" }} /></div>
        <div style={{ marginBottom:"16px" }}><label style={{ display:"block", marginBottom:"6px", fontSize:"13px", color:s.text2 }}>封面图片URL</label><input value={form.coverUrl} onChange={(e) => setForm({...form, coverUrl:e.target.value})} style={{ width:"100%", height:"36px", padding:"0 12px", border:"1px solid " + s.border, borderRadius:s.radius, boxSizing:"border-box" }} /></div>
        <div style={{ marginBottom:"16px" }}><label style={{ display:"block", marginBottom:"6px", fontSize:"13px", color:s.text2 }}>简介</label><textarea value={form.description} onChange={(e) => setForm({...form, description:e.target.value})} rows={4} style={{ width:"100%", padding:"8px 12px", border:"1px solid " + s.border, borderRadius:s.radius, boxSizing:"border-box", resize:"vertical" }} /></div>
        <div style={{ marginBottom:"16px" }}><label style={{ display:"block", marginBottom:"6px", fontSize:"13px", color:s.text2 }}>跳转地址</label><input value={form.address} onChange={(e) => setForm({...form, address:e.target.value})} placeholder="https://" style={{ width:"100%", height:"36px", padding:"0 12px", border:"1px solid " + s.border, borderRadius:s.radius, boxSizing:"border-box" }} /></div>
        <div style={{ marginBottom:"16px" }}><label style={{ display:"block", marginBottom:"6px", fontSize:"13px", color:s.text2 }}>排序权重</label><input type="number" value={form.sortOrder} onChange={(e) => setForm({...form, sortOrder: parseInt(e.target.value)||0})} style={{ width:"120px", height:"36px", padding:"0 12px", border:"1px solid " + s.border, borderRadius:s.radius, boxSizing:"border-box" }} /></div>
        <div style={{ marginBottom:"16px" }}><label style={{ display:"block", marginBottom:"6px", fontSize:"13px", color:s.text2 }}>状态</label><div style={{ display:"flex", alignItems:"center", gap:"8px" }}><button onClick={() => setForm({...form, status: form.status===1?0:1})} style={{ width:"44px", height:"24px", borderRadius:"12px", border:"none", backgroundColor: form.status===1?"#67c23a":"#c0c4cc", position:"relative", cursor:"pointer" }}><span style={{ display:"block", width:"18px", height:"18px", borderRadius:"50%", background:"#fff", position:"absolute", top:"3px", left: form.status===1?"23px":"3px", transition:"left 0.2s" }} /></button><span style={{ fontSize:"13px", color:s.text2 }}>{form.status===1?"上架":"下架"}</span></div></div>
        <div style={{ display:"flex", justifyContent:"flex-end", gap:"10px" }}>
          <button onClick={() => router.back()} style={{ height:"36px", padding:"0 20px", border:"1px solid " + s.border, borderRadius:s.radius, background:s.white, cursor:"pointer" }}>取消</button>
          <button onClick={handleSave} style={{ height:"36px", padding:"0 20px", backgroundColor:s.primary, color:"#fff", border:"none", borderRadius:s.radius, cursor:"pointer" }}>保存</button>
        </div>
      </div>
    </div>
  );
}
