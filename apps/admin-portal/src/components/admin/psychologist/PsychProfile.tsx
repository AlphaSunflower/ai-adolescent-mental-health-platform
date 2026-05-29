"use client";

import { useState, useEffect } from "react";
import { httpClient } from "@/lib/api-admin";

const s = {
  primary: "#409eff", green: "#67c23a", orange: "#e6a23c", red: "#f56c6c",
  text: "#303133", text2: "#606266", text3: "#909399",
  border: "#dcdfe6", bg: "#f0f2f5", white: "#fff",
  radius: "4px", shadow: "0 2px 12px rgba(0,0,0,0.06)",
  statCardBg: "#fff",
};

interface Profile {
  realName: string; title: string; specialty: string;
  introduction: string; avatar: string; qualifications: string;
}

export function PsychProfile() {
  const [profile, setProfile] = useState<Profile>({
    realName: "", title: "", specialty: "", introduction: "", avatar: "", qualifications: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    httpClient.get<Profile>("/psychologist/profile")
      .then((p) => { setProfile(p); })
      .catch((err: unknown) => { setError(err instanceof Error ? err.message : "Unknown error"); })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true); setSuccessMsg("");
    try {
      await httpClient.put("/psychologist/profile", profile);
      setSuccessMsg("保存成功");
    } catch (err: unknown) { setError(err instanceof Error ? err.message : "Unknown error"); }
    finally { setSaving(false); }
  };

  if (loading) return <div style={{ padding: "40px", textAlign: "center", color: s.text3 }}>加载中...</div>;

  const labelStyle: React.CSSProperties = { display: "block", fontSize: "13px", color: s.text2, marginBottom: "4px" };
  const inputStyle: React.CSSProperties = { width: "100%", height: "36px", padding: "0 12px", border: "1px solid " + s.border, borderRadius: s.radius, fontSize: "13px", boxSizing: "border-box" };

  return (
    <div style={{ padding: "20px", backgroundColor: s.bg, minHeight: "100%" }}>
      <div style={{ backgroundColor: s.white, borderRadius: "8px", boxShadow: s.shadow, padding: "24px", maxWidth: "640px" }}>
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

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={labelStyle}>姓名</label>
            <input value={profile.realName} onChange={(e) => setProfile({ ...profile, realName: e.target.value })} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>职称</label>
            <input value={profile.title} onChange={(e) => setProfile({ ...profile, title: e.target.value })} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>擅长领域</label>
            <input value={profile.specialty} onChange={(e) => setProfile({ ...profile, specialty: e.target.value })} style={inputStyle} placeholder="例如：青少年心理、情绪管理" />
          </div>
          <div>
            <label style={labelStyle}>个人简介</label>
            <textarea value={profile.introduction} onChange={(e) => setProfile({ ...profile, introduction: e.target.value })} rows={4}
              style={{ width: "100%", padding: "8px 12px", border: "1px solid " + s.border, borderRadius: s.radius, fontSize: "13px", boxSizing: "border-box", resize: "vertical" }} />
          </div>
          <div>
            <label style={labelStyle}>头像地址</label>
            <input value={profile.avatar} onChange={(e) => setProfile({ ...profile, avatar: e.target.value })} style={inputStyle} placeholder="https://..." />
          </div>
          <div>
            <label style={labelStyle}>资质证书</label>
            <textarea value={profile.qualifications} onChange={(e) => setProfile({ ...profile, qualifications: e.target.value })} rows={3}
              style={{ width: "100%", padding: "8px 12px", border: "1px solid " + s.border, borderRadius: s.radius, fontSize: "13px", boxSizing: "border-box", resize: "vertical" }} placeholder="描述您的专业资质和证书" />
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
