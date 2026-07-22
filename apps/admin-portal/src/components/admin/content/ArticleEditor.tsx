"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { httpClient } from "@/lib/api-admin";
import { getStoredUser } from "@/lib/session";
import MDEditor from "@uiw/react-md-editor";

import { s } from "@/lib/design-tokens";

export function ArticleEditor() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string | undefined;
  const isEdit = !!id;
  const [form, setForm] = useState<Record<string,unknown>>({ title: "", content: "", summary: "", coverImage: "", tags: "", status: 1 });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const user = getStoredUser<Record<string,unknown>>();
  const role = (user?.role as number) ?? undefined;

  useEffect(() => {
    let cancelled = false;
    if (id) {
      setLoading(true);
      httpClient.get<Record<string,unknown>>(`/content/article/${id}`).then((data) => {
        if (cancelled) return;
        setForm({
          title: (data.title as string) || "",
          content: (data.content as string) || "",
          summary: (data.summary as string) || "",
          coverImage: (data.coverImage as string) || "",
          tags: (data.tags as string) || "",
          status: (data.status as number) ?? 1,
        });
      }).catch(() => {}).finally(() => { if (!cancelled) setLoading(false); });
    }
    return () => { cancelled = true; };
  }, [id]);

  const handleSave = async () => {
    if (!form.title || !(form.title as string).trim()) { alert("请输入文章标题"); return; }
    setSaving(true);
    try {
      const payload = { ...form, role: role };
      if (isEdit) {
        await httpClient.put("/content/article", payload);
      } else {
        await httpClient.post("/content/article", payload);
      }
      router.push("/admin/content/articles");
    } catch { alert("保存失败"); }
    finally { setSaving(false); }
  };

  if (loading) return <div style={{ padding:"40px", textAlign:"center", color:s.text3 }}>加载中...</div>;

  return (
    <div style={{ padding:"20px", backgroundColor:s.bg, minHeight:"100%" }}>
      <div style={{ backgroundColor:s.white, borderRadius:"8px", boxShadow:"0 2px 12px rgba(0,0,0,0.06)", padding:"20px", maxWidth:"1100px" }}>
        <h3 style={{ margin:"0 0 20px", fontSize:"18px", color:s.text }}>{isEdit?"编辑文章":"新增文章"}</h3>

        <div style={{ marginBottom:"16px" }}>
          <label style={{ display:"block", marginBottom:"6px", fontSize:"13px", color:s.text2 }}>标题</label>
          <input value={form.title as string} onChange={(e) => setForm({...form, title:e.target.value})}
            style={{ width:"100%", height:"40px", padding:"0 12px", border:`1px solid ${s.border}`, borderRadius:s.radius, boxSizing:"border-box", fontSize:"15px", fontWeight:500 }} />
        </div>

        <div style={{ marginBottom:"16px" }}>
          <label style={{ display:"block", marginBottom:"6px", fontSize:"13px", color:s.text2 }}>摘要</label>
          <textarea value={form.summary as string} onChange={(e) => setForm({...form, summary:e.target.value})} rows={2}
            style={{ width:"100%", padding:"8px 12px", border:`1px solid ${s.border}`, borderRadius:s.radius, boxSizing:"border-box", resize:"vertical", fontSize:"13px" }} />
        </div>

        <div style={{ marginBottom:"16px" }} data-color-mode="light">
          <label style={{ display:"block", marginBottom:"6px", fontSize:"13px", color:s.text2 }}>内容 (Markdown)</label>
          <MDEditor
            value={form.content as string}
            onChange={(val) => setForm({...form, content: val ?? ""})}
            height={500}
            preview="live"
          />
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"16px", marginBottom:"16px" }}>
          <div>
            <label style={{ display:"block", marginBottom:"6px", fontSize:"13px", color:s.text2 }}>封面图片URL</label>
            <input value={form.coverImage as string} onChange={(e) => setForm({...form, coverImage:e.target.value})}
              style={{ width:"100%", height:"36px", padding:"0 12px", border:`1px solid ${s.border}`, borderRadius:s.radius, boxSizing:"border-box" }} />
          </div>
          <div>
            <label style={{ display:"block", marginBottom:"6px", fontSize:"13px", color:s.text2 }}>标签（逗号分隔）</label>
            <input value={form.tags as string} onChange={(e) => setForm({...form, tags:e.target.value})}
              style={{ width:"100%", height:"36px", padding:"0 12px", border:`1px solid ${s.border}`, borderRadius:s.radius, boxSizing:"border-box" }} />
          </div>
        </div>

        <div style={{ marginBottom:"20px" }}>
          <label style={{ display:"block", marginBottom:"6px", fontSize:"13px", color:s.text2 }}>状态</label>
          <select value={form.status as number} onChange={(e) => setForm({...form, status:Number(e.target.value)})}
            style={{ width:"150px", height:"36px", padding:"0 12px", border:`1px solid ${s.border}`, borderRadius:s.radius }}>
            <option value={0}>草稿</option>
            <option value={1}>发布</option>
          </select>
        </div>

        <div style={{ display:"flex", justifyContent:"flex-end", gap:"10px" }}>
          <button onClick={() => router.push("/admin/content/articles")}
            style={{ height:"36px", padding:"0 20px", border:`1px solid ${s.border}`, borderRadius:s.radius, background:s.white, cursor:"pointer" }}>取消</button>
          <button onClick={handleSave} disabled={saving}
            style={{ height:"36px", padding:"0 20px", backgroundColor:s.primary, color:"#fff", border:"none", borderRadius:s.radius, cursor:"pointer", opacity: saving?0.7:1 }}>
            {saving ? "保存中..." : "保存"}
          </button>
        </div>
      </div>
    </div>
  );
}
