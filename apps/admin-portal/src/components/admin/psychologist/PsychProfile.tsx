"use client";

import { useState, useEffect, useRef } from "react";
import { httpClient } from "@/lib/api-admin";
import { getToken } from "@/lib/session";

import { s } from "@/lib/design-tokens";

interface Profile {
  realName: string; headPath: string; sex: number; introduction: string;
  yearsExperience: number; consultationPrice: number; offlinePrice: number;
  educationBackground: string; trainingExperience: string;
  offlineRegion: string; offlineAddress: string; languages: string;
}

export function PsychProfile() {
  const [profile, setProfile] = useState<Profile>({
    realName: "", headPath: "", sex: 0, introduction: "",
    yearsExperience: 0, consultationPrice: 0, offlinePrice: 0,
    educationBackground: "", trainingExperience: "",
    offlineRegion: "", offlineAddress: "", languages: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [uploading, setUploading] = useState(false);
  const [onlineStatus, setOnlineStatus] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const authToken = getToken() || "";

  const fetchProfile = () => {
    setLoading(true); setError(null);
    Promise.all([
      httpClient.get<Record<string, unknown>>("/psychologist/admin/profile"),
      httpClient.get<Record<string, unknown>>("/psychologist/admin/me"),
    ])
      .then(([p, me]) => {
        setProfile({
          realName: (p.realName as string) || "",
          headPath: (p.headPath as string) || "",
          sex: (p.sex as number) ?? 0,
          introduction: (p.introduction as string) || "",
          yearsExperience: (p.yearsExperience as number) || 0,
          consultationPrice: (p.consultationPrice as number) || 0,
          offlinePrice: (p.offlinePrice as number) || 0,
          educationBackground: (p.educationBackground as string) || "",
          trainingExperience: (p.trainingExperience as string) || "",
          offlineRegion: (p.offlineRegion as string) || "",
          offlineAddress: (p.offlineAddress as string) || "",
          languages: (p.languages as string) || "",
        });
        const psy = (me.psychologist as Record<string, unknown>) || me;
        setOnlineStatus((psy.onlineStatus as number) ?? 0);
      })
      .catch((err: unknown) => { setError(err instanceof Error ? err.message : "加载失败"); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProfile(); }, []);

  const handleSave = async () => {
    setSaving(true); setSuccessMsg(""); setError(null);
    try {
      await httpClient.put("/psychologist/admin/profile", profile);
      setSuccessMsg("保存成功");
    } catch (err: unknown) { setError(err instanceof Error ? err.message : "保存失败"); }
    finally { setSaving(false); }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError("只能上传图片文件"); return; }
    if (file.size > 2 * 1024 * 1024) { setError("图片大小不能超过2MB"); return; }
    setUploading(true); setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const url = await httpClient.post<string>("/common/upload", formData);
      setProfile({ ...profile, headPath: url });
      setSuccessMsg("头像上传成功");
    } catch { setError("上传失败，请重试"); }
    finally { setUploading(false); }
  };

  const handleToggleOnline = async () => {
    if (onlineStatus === null) return;
    const newStatus = onlineStatus === 1 ? 0 : 1;
    try {
      await httpClient.post("/psychologist/status", {}, { query: { status: String(newStatus) } });
      setOnlineStatus(newStatus);
      setSuccessMsg(newStatus === 1 ? "已切换为在线" : "已切换为离线");
    } catch (err: unknown) { setError(err instanceof Error ? err.message : "状态切换失败"); }
  };

  if (loading) return <div style={{ padding: "40px", textAlign: "center", color: s.text3 }}>加载中...</div>;

  const labelStyle: React.CSSProperties = { display: "block", fontSize: "13px", color: s.text2, marginBottom: "4px" };
  const inputStyle: React.CSSProperties = { width: "100%", height: "36px", padding: "0 12px", border: "1px solid " + s.border, borderRadius: s.radius, fontSize: "13px", boxSizing: "border-box" as const };

  return (
    <div style={{ padding: "20px", backgroundColor: s.bg, minHeight: "100%" }}>
      <div style={{ backgroundColor: s.white, borderRadius: "8px", boxShadow: s.shadow, padding: "24px", maxWidth: "700px" }}>
        <h3 style={{ margin: "0 0 24px 0", fontSize: "18px", fontWeight: 600, color: s.text }}>个人资料</h3>

        {error && (
          <div style={{ marginBottom: "16px", padding: "10px 16px", backgroundColor: "#fef0f0", color: s.red, borderRadius: s.radius, fontSize: "13px" }}>
            {error}
            <button onClick={() => setError(null)} style={{ marginLeft: "12px", color: s.red, border: "none", background: "none", cursor: "pointer" }}>关闭</button>
          </div>
        )}
        {successMsg && (
          <div style={{ marginBottom: "16px", padding: "10px 16px", backgroundColor: "#f0f9eb", color: s.green, borderRadius: s.radius, fontSize: "13px" }}>{successMsg}</div>
        )}

        {/* Online Status Toggle */}
        {onlineStatus !== null && (
          <div style={{ marginBottom: "24px", padding: "16px", backgroundColor: s.bg, borderRadius: s.radius, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: "14px", fontWeight: 600, color: s.text }}>
                当前状态：
                <span style={{ color: onlineStatus === 1 ? s.green : onlineStatus === 2 ? s.orange : s.text3 }}>
                  {onlineStatus === 1 ? "在线" : onlineStatus === 2 ? "忙碌" : "离线"}
                </span>
              </div>
              <div style={{ fontSize: "12px", color: s.text3, marginTop: "4px" }}>切换在线/离线状态以接收新的咨询预约</div>
            </div>
            <button onClick={handleToggleOnline} disabled={onlineStatus === 2}
              style={{
                height: "36px", padding: "0 24px", border: "none", borderRadius: "20px", cursor: "pointer", fontSize: "14px", fontWeight: 500,
                backgroundColor: onlineStatus === 1 ? s.orange + "15" : s.green + "15",
                color: onlineStatus === 1 ? s.orange : s.green,
                opacity: onlineStatus === 2 ? 0.5 : 1,
              }}>
              {onlineStatus === 1 ? "切换为离线" : onlineStatus === 2 ? "忙碌中" : "切换为在线"}
            </button>
          </div>
        )}

        {/* Avatar */}
        <div style={{ marginBottom: "20px" }}>
          <label style={labelStyle}>头像</label>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                width: "80px", height: "80px", borderRadius: "8px", border: "2px solid " + s.border,
                overflow: "hidden", cursor: "pointer", position: "relative",
                backgroundColor: s.bg, display: "flex", alignItems: "center", justifyContent: "center",
              }}>
              {profile.headPath ? (
                <img src={profile.headPath} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <span style={{ fontSize: "28px", color: s.text3 }}>+</span>
              )}
              {uploading && (
                <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: "12px", color: s.text2 }}>上传中...</span>
                </div>
              )}
            </div>
            <div>
              <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
                style={{ height: "32px", padding: "0 16px", backgroundColor: s.primary, color: "#fff", border: "none", borderRadius: s.radius, cursor: "pointer", fontSize: "13px" }}>
                {uploading ? "上传中..." : profile.headPath ? "更换头像" : "上传头像"}
              </button>
              <div style={{ fontSize: "12px", color: s.text3, marginTop: "4px" }}>支持 JPG/PNG，不超过 2MB</div>
            </div>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleUpload} style={{ display: "none" }} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div>
            <label style={labelStyle}>姓名</label>
            <input value={profile.realName} onChange={(e) => setProfile({ ...profile, realName: e.target.value })} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>性别</label>
            <div style={{ display: "flex", gap: "16px", alignItems: "center", height: "36px" }}>
              {[{ v: 1, l: "男" }, { v: 2, l: "女" }, { v: 0, l: "未知" }].map(o => <label key={o.v} style={{ fontSize: "13px", cursor: "pointer" }}><input type="radio" checked={profile.sex === o.v} onChange={() => setProfile({ ...profile, sex: o.v })} /> {o.l}</label>)}
            </div>
          </div>
          <div>
            <label style={labelStyle}>从业年限</label>
            <input type="number" value={profile.yearsExperience} onChange={(e) => setProfile({ ...profile, yearsExperience: Number(e.target.value) || 0 })} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>咨询价格 (元/小时)</label>
            <input type="number" value={profile.consultationPrice} onChange={(e) => setProfile({ ...profile, consultationPrice: Number(e.target.value) || 0 })} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>线下价格</label>
            <input type="number" value={profile.offlinePrice} onChange={(e) => setProfile({ ...profile, offlinePrice: Number(e.target.value) || 0 })} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>教育背景</label>
            <input value={profile.educationBackground} onChange={(e) => setProfile({ ...profile, educationBackground: e.target.value })} style={inputStyle} />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={labelStyle}>擅长语言</label>
            <input value={profile.languages} onChange={(e) => setProfile({ ...profile, languages: e.target.value })} style={inputStyle} placeholder="如：中文,英语" />
          </div>
          <div>
            <label style={labelStyle}>线下地区</label>
            <input value={profile.offlineRegion} onChange={(e) => setProfile({ ...profile, offlineRegion: e.target.value })} style={inputStyle} placeholder="如：北京市朝阳区" />
          </div>
          <div>
            <label style={labelStyle}>线下地址</label>
            <input value={profile.offlineAddress} onChange={(e) => setProfile({ ...profile, offlineAddress: e.target.value })} style={inputStyle} placeholder="详细地址" />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={labelStyle}>个人简介</label>
            <textarea value={profile.introduction} onChange={(e) => setProfile({ ...profile, introduction: e.target.value })} rows={4}
              style={{ width: "100%", padding: "8px 12px", border: "1px solid " + s.border, borderRadius: s.radius, fontSize: "13px", boxSizing: "border-box", resize: "vertical" }} />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={labelStyle}>培训经历</label>
            <textarea value={profile.trainingExperience} onChange={(e) => setProfile({ ...profile, trainingExperience: e.target.value })} rows={3}
              style={{ width: "100%", padding: "8px 12px", border: "1px solid " + s.border, borderRadius: s.radius, fontSize: "13px", boxSizing: "border-box", resize: "vertical" }} />
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "24px" }}>
          <button onClick={handleSave} disabled={saving}
            style={{ height: "36px", padding: "0 28px", backgroundColor: s.primary, color: s.white, border: "none", borderRadius: s.radius, cursor: "pointer", fontSize: "14px", opacity: saving ? 0.7 : 1 }}>
            {saving ? "保存中..." : "保存"}
          </button>
        </div>
      </div>
    </div>
  );
}
