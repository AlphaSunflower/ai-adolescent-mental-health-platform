"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { httpClient } from "@/lib/api-admin";

const s = {
  primary: "#409eff", text: "#303133", text2: "#606266", text3: "#909399",
  border: "#dcdfe6", bg: "#f0f2f5", white: "#fff", radius: "4px",
};

export function ArticleEditor() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string | undefined;
  const isEdit = !!id;
  const [form, setForm] = useState<Record<string,unknown>>({ title: "", content: "", summary: "", coverImage: "", tags: "", status: 1 });

  useEffect(() => {
    if (id) {
      httpClient.get<Record<string,unknown>>(`/content/article/${id}`).then(setForm).catch(() => {});
    }
  }, [id]);

  const handleSave = async () => {
    try {
      if (isEdit) {
        await httpClient.put("/content/article", form);
      } else {
        await httpClient.post("/content/article", form);
      }
      router.push("/admin/content/articles");
    } catch { /* ignore */ }
  };

  return (
    <div style={{ padding:"20px", backgroundColor:s.bg, minHeight:"100%" }}>
      <div style={{ backgroundColor:s.white, borderRadius:"8px", boxShadow:"0 2px 12px rgba(0,0,0,0.06)", padding:"20px", maxWidth:"900px" }}>
        <h3 style={{ margin:"0 0 20px", fontSize:"18px", color:s.text }}>{isEdit?"编辑文章":"新增文章"}</h3>
        <div style={{ marginBottom:"16px" }}><label style={{ display:"block", marginBottom:"6px", fontSize:"13px", color:s.text2 }}>标题</label><input value={form.title as string} onChange={(e) => setForm({...form, title:e.target.value})} style={{ width:"100%", height:"36px", padding:"0 12px", border:`1px solid ${s.border}`, borderRadius:s.radius, boxSizing:"border-box" }} /></div>
        <div style={{ marginBottom:"16px" }}><label style={{ display:"block", marginBottom:"6px", fontSize:"13px", color:s.text2 }}>摘要</label><textarea value={form.summary as string} onChange={(e) => setForm({...form, summary:e.target.value})} rows={3} style={{ width:"100%", padding:"8px 12px", border:`1px solid ${s.border}`, borderRadius:s.radius, boxSizing:"border-box", resize:"vertical" }} /></div>
        <div style={{ marginBottom:"16px" }}><label style={{ display:"block", marginBottom:"6px", fontSize:"13px", color:s.text2 }}>内容 (Markdown)</label><textarea value={form.content as string} onChange={(e) => setForm({...form, content:e.target.value})} rows={16} style={{ width:"100%", padding:"8px 12px", border:`1px solid ${s.border}`, borderRadius:s.radius, boxSizing:"border-box", resize:"vertical", fontFamily:"monospace" }} /></div>
        <div style={{ marginBottom:"16px" }}><label style={{ display:"block", marginBottom:"6px", fontSize:"13px", color:s.text2 }}>封面图片URL</label><input value={form.coverImage as string} onChange={(e) => setForm({...form, coverImage:e.target.value})} style={{ width:"100%", height:"36px", padding:"0 12px", border:`1px solid ${s.border}`, borderRadius:s.radius, boxSizing:"border-box" }} /></div>
        <div style={{ marginBottom:"16px" }}><label style={{ display:"block", marginBottom:"6px", fontSize:"13px", color:s.text2 }}>标签（逗号分隔）</label><input value={form.tags as string} onChange={(e) => setForm({...form, tags:e.target.value})} style={{ width:"100%", height:"36px", padding:"0 12px", border:`1px solid ${s.border}`, borderRadius:s.radius, boxSizing:"border-box" }} /></div>
        <div style={{ marginBottom:"20px" }}><label style={{ display:"block", marginBottom:"6px", fontSize:"13px", color:s.text2 }}>状态</label><select value={form.status as number} onChange={(e) => setForm({...form, status:Number(e.target.value)})} style={{ width:"100%", height:"36px", padding:"0 12px", border:`1px solid ${s.border}`, borderRadius:s.radius }}><option value={0}>草稿</option><option value={1}>发布</option></select></div>
        <div style={{ display:"flex", justifyContent:"flex-end", gap:"10px" }}>
          <button onClick={() => router.back()} style={{ height:"36px", padding:"0 20px", border:`1px solid ${s.border}`, borderRadius:s.radius, background:s.white, cursor:"pointer" }}>取消</button>
          <button onClick={handleSave} style={{ height:"36px", padding:"0 20px", backgroundColor:s.primary, color:"#fff", border:"none", borderRadius:s.radius, cursor:"pointer" }}>保存</button>
        </div>
      </div>
    </div>
  );
}
