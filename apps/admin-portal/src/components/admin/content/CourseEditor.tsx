"use client";

import { useState, useEffect } from "react";
import { tokens } from "@/lib/design-tokens";
import { useRouter, useParams } from "next/navigation";
import { httpClient } from "@/lib/api-admin";

import { s } from "@/lib/design-tokens";

export function CourseEditor() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string | undefined;
  const isEdit = !!id;
  const [form, setForm] = useState({ title: "", type: "", description: "", coverUrl: "", sourceType: "third_party", sourceName: "", sourceUrl: "", storageProvider: "oss", status: 1 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      setLoading(true);
      httpClient.get<Record<string,unknown>>("/content/admin/course/" + id).then((data) => setForm({
        title: (data.title as string) || "",
        type: (data.type as string) || "",
        description: (data.description as string) || "",
        coverUrl: (data.coverUrl as string) || "",
        sourceType: (data.sourceType as string) || "third_party",
        sourceName: (data.sourceName as string) || "",
        sourceUrl: (data.sourceUrl as string) || "",
        storageProvider: (data.storageProvider as string) || "oss",
        status: (data.status as number) ?? 1,
      })).catch(() => {}).finally(() => setLoading(false));
    }
  }, [id]);

  const handleSave = async () => {
    if (!form.title.trim()) { alert("请输入课程名称"); return; }
    try {
      await httpClient.post("/content/course", isEdit ? { id: Number(id), ...form } : form);
      router.push("/admin/content/courses");
    } catch { alert("保存失败"); }
  };

  if (loading) return <div style={{ padding:"40px", textAlign:"center", color:s.text3 }}>加载中...</div>;

  return (
    <div style={{ padding:"20px", backgroundColor:s.bg, minHeight:"100%" }}>
      <div style={{ backgroundColor:s.white, borderRadius:"8px", boxShadow:"0 2px 12px rgba(0,0,0,0.06)", padding:"20px", maxWidth:"700px" }}>
        <h3 style={{ margin:"0 0 20px", fontSize:"18px", color:s.text }}>{isEdit ? "编辑课程" : "新增课程"}</h3>
        <div style={{ marginBottom:"16px" }}><label style={{ display:"block", marginBottom:"6px", fontSize:"13px", color:s.text2 }}>课程名称</label><input value={form.title} onChange={(e) => setForm({...form, title:e.target.value})} style={{ width:"100%", height:"36px", padding:"0 12px", border:"1px solid " + s.border, borderRadius:s.radius, boxSizing:"border-box" }} /></div>
        <div style={{ marginBottom:"16px" }}><label style={{ display:"block", marginBottom:"6px", fontSize:"13px", color:s.text2 }}>分类编码</label><input value={form.type} onChange={(e) => setForm({...form, type:e.target.value})} placeholder="如：VIDEO, AUDIO" style={{ width:"100%", height:"36px", padding:"0 12px", border:"1px solid " + s.border, borderRadius:s.radius, boxSizing:"border-box" }} /></div>
        <div style={{ marginBottom:"16px" }}><label style={{ display:"block", marginBottom:"6px", fontSize:"13px", color:s.text2 }}>简介</label><textarea value={form.description} onChange={(e) => setForm({...form, description:e.target.value})} rows={3} style={{ width:"100%", padding:"8px 12px", border:"1px solid " + s.border, borderRadius:s.radius, boxSizing:"border-box", resize:"vertical" }} /></div>

        {/* Source type */}
        <div style={{ marginBottom:"16px" }}>
          <label style={{ display:"block", marginBottom:"6px", fontSize:"13px", color:s.text2 }}>来源模式</label>
          <div style={{ display:"flex", gap:"20px" }}>
            <label style={{ fontSize:"13px", cursor:"pointer", display:"flex", alignItems:"center", gap:"6px" }}>
              <input type="radio" checked={form.sourceType==="third_party"} onChange={() => setForm({...form, sourceType:"third_party"})} /> 第三方平台
            </label>
            <label style={{ fontSize:"13px", cursor:"pointer", display:"flex", alignItems:"center", gap:"6px" }}>
              <input type="radio" checked={form.sourceType==="self_hosted"} onChange={() => setForm({...form, sourceType:"self_hosted"})} /> 自有存储
            </label>
          </div>
        </div>

        {form.sourceType === "third_party" ? (
          <>
            <div style={{ marginBottom:"16px" }}><label style={{ display:"block", marginBottom:"6px", fontSize:"13px", color:s.text2 }}>平台名称</label><input value={form.sourceName} onChange={(e) => setForm({...form, sourceName:e.target.value})} placeholder="如：B站、腾讯视频" style={{ width:"100%", height:"36px", padding:"0 12px", border:"1px solid " + s.border, borderRadius:s.radius, boxSizing:"border-box" }} /></div>
            <div style={{ marginBottom:"16px" }}><label style={{ display:"block", marginBottom:"6px", fontSize:"13px", color:s.text2 }}>视频链接</label><input value={form.sourceUrl} onChange={(e) => setForm({...form, sourceUrl:e.target.value})} placeholder="第三方视频播放页URL" style={{ width:"100%", height:"36px", padding:"0 12px", border:"1px solid " + s.border, borderRadius:s.radius, boxSizing:"border-box" }} /></div>
          </>
        ) : (
          <>
            <div style={{ marginBottom:"16px" }}><label style={{ display:"block", marginBottom:"6px", fontSize:"13px", color:s.text2 }}>存储源</label>
              <select value={form.storageProvider} onChange={(e) => setForm({...form, storageProvider:e.target.value})} style={{ width:"100%", height:"36px", padding:"0 12px", border:"1px solid " + s.border, borderRadius:s.radius, boxSizing:"border-box" }}>
                <option value="oss">阿里云OSS</option>
                <option value="local">本地存储</option>
              </select>
            </div>
            <div style={{ marginBottom:"16px" }}><label style={{ display:"block", marginBottom:"6px", fontSize:"13px", color:s.text2 }}>资源地址</label><input value={form.sourceUrl} onChange={(e) => setForm({...form, sourceUrl:e.target.value})} placeholder="视频/音频文件直链" style={{ width:"100%", height:"36px", padding:"0 12px", border:"1px solid " + s.border, borderRadius:s.radius, boxSizing:"border-box" }} /></div>
          </>
        )}

        <div style={{ marginBottom:"16px" }}><label style={{ display:"block", marginBottom:"6px", fontSize:"13px", color:s.text2 }}>封面图片URL</label><input value={form.coverUrl} onChange={(e) => setForm({...form, coverUrl:e.target.value})} style={{ width:"100%", height:"36px", padding:"0 12px", border:"1px solid " + s.border, borderRadius:s.radius, boxSizing:"border-box" }} /></div>
        <div style={{ marginBottom:"16px" }}><label style={{ display:"block", marginBottom:"6px", fontSize:"13px", color:s.text2 }}>状态</label><div style={{ display:"flex", alignItems:"center", gap:"8px" }}><button onClick={() => setForm({...form, status: form.status===1?0:1})} style={{ width:"44px", height:"24px", borderRadius:"12px", border:"none", backgroundColor: form.status===1?tokens.success:"#c0c4cc", position:"relative", cursor:"pointer" }}><span style={{ display:"block", width:"18px", height:"18px", borderRadius:"50%", background:"#fff", position:"absolute", top:"3px", left: form.status===1?"23px":"3px", transition:"left 0.2s" }} /></button><span style={{ fontSize:"13px", color:s.text2 }}>{form.status===1?"上架":"下架"}</span></div></div>
        <div style={{ display:"flex", justifyContent:"flex-end", gap:"10px" }}>
          <button onClick={() => router.back()} style={{ height:"36px", padding:"0 20px", border:"1px solid " + s.border, borderRadius:s.radius, background:s.white, cursor:"pointer" }}>取消</button>
          <button onClick={handleSave} style={{ height:"36px", padding:"0 20px", backgroundColor:s.primary, color:"#fff", border:"none", borderRadius:s.radius, cursor:"pointer" }}>保存</button>
        </div>
      </div>
    </div>
  );
}
