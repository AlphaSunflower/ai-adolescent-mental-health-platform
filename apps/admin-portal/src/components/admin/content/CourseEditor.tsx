"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { httpClient } from "@/lib/api-admin";

const s = { primary: "#409eff", text: "#303133", text2: "#606266", text3: "#909399", border: "#dcdfe6", bg: "#f0f2f5", white: "#fff", radius: "4px" };

export function CourseEditor() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string | undefined;
  const isEdit = !!id;
  const [form, setForm] = useState({ title: "", instructor: "", description: "", coverImage: "", category: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      setLoading(true);
      httpClient.get<Record<string,unknown>>("/admin/courses/" + id).then((data) => setForm(data as typeof form)).catch(() => {}).finally(() => setLoading(false));
    }
  }, [id]);

  const handleSave = async () => {
    if (!form.title.trim()) { alert("请输入课程名称"); return; }
    try {
      if (isEdit) {
        await httpClient.put("/admin/courses/" + id, form);
      } else {
        await httpClient.post("/admin/courses", form);
      }
      router.push("/admin/content/courses");
    } catch { alert("保存失败"); }
  };

  if (loading) return <div style={{ padding:"40px", textAlign:"center", color:s.text3 }}>加载中...</div>;

  return (
    <div style={{ padding:"20px", backgroundColor:s.bg, minHeight:"100%" }}>
      <div style={{ backgroundColor:s.white, borderRadius:"8px", boxShadow:"0 2px 12px rgba(0,0,0,0.06)", padding:"20px", maxWidth:"700px" }}>
        <h3 style={{ margin:"0 0 20px", fontSize:"18px", color:s.text }}>{isEdit ? "编辑课程" : "新增课程"}</h3>
        <div style={{ marginBottom:"16px" }}><label style={{ display:"block", marginBottom:"6px", fontSize:"13px", color:s.text2 }}>课程名称</label><input value={form.title} onChange={(e) => setForm({...form, title:e.target.value})} style={{ width:"100%", height:"36px", padding:"0 12px", border:"1px solid " + s.border, borderRadius:s.radius, boxSizing:"border-box" }} /></div>
        <div style={{ marginBottom:"16px" }}><label style={{ display:"block", marginBottom:"6px", fontSize:"13px", color:s.text2 }}>讲师</label><input value={form.instructor} onChange={(e) => setForm({...form, instructor:e.target.value})} style={{ width:"100%", height:"36px", padding:"0 12px", border:"1px solid " + s.border, borderRadius:s.radius, boxSizing:"border-box" }} /></div>
        <div style={{ marginBottom:"16px" }}><label style={{ display:"block", marginBottom:"6px", fontSize:"13px", color:s.text2 }}>分类</label><input value={form.category} onChange={(e) => setForm({...form, category:e.target.value})} style={{ width:"100%", height:"36px", padding:"0 12px", border:"1px solid " + s.border, borderRadius:s.radius, boxSizing:"border-box" }} /></div>
        <div style={{ marginBottom:"16px" }}><label style={{ display:"block", marginBottom:"6px", fontSize:"13px", color:s.text2 }}>封面图片URL</label><input value={form.coverImage} onChange={(e) => setForm({...form, coverImage:e.target.value})} style={{ width:"100%", height:"36px", padding:"0 12px", border:"1px solid " + s.border, borderRadius:s.radius, boxSizing:"border-box" }} /></div>
        <div style={{ marginBottom:"16px" }}><label style={{ display:"block", marginBottom:"6px", fontSize:"13px", color:s.text2 }}>描述</label><textarea value={form.description} onChange={(e) => setForm({...form, description:e.target.value})} rows={4} style={{ width:"100%", padding:"8px 12px", border:"1px solid " + s.border, borderRadius:s.radius, boxSizing:"border-box", resize:"vertical" }} /></div>
        <div style={{ display:"flex", justifyContent:"flex-end", gap:"10px" }}>
          <button onClick={() => router.back()} style={{ height:"36px", padding:"0 20px", border:"1px solid " + s.border, borderRadius:s.radius, background:s.white, cursor:"pointer" }}>取消</button>
          <button onClick={handleSave} style={{ height:"36px", padding:"0 20px", backgroundColor:s.primary, color:"#fff", border:"none", borderRadius:s.radius, cursor:"pointer" }}>保存</button>
        </div>
      </div>
    </div>
  );
}
