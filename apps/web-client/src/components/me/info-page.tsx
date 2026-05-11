"use client";

import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { Camera, Mail, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { api } from "@/lib/api";
import { getToken } from "@/lib/session";
import type { UserProfile } from "@/lib/types";

export function InfoPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Record<string, string | number>>({});
  const [originalForm, setOriginalForm] = useState<Record<string, string | number>>({});
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [saving, setSaving] = useState(false);

  // Email dialog
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [emailCode, setEmailCode] = useState("");
  const [emailCodeSending, setEmailCodeSending] = useState(false);
  const [emailCountdown, setEmailCountdown] = useState(0);
  const [emailRemaining, setEmailRemaining] = useState(2);
  const [emailDialogError, setEmailDialogError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.user.getUserInfo().then((p) => {
      setProfile(p);
      const f = { nickname: p.nickname || "", sex: p.sex ?? 0, birthday: (p as Record<string, unknown>).birthday as string || "", phone: p.phone || "", signature: p.signature || "", email: p.email || "" };
      setForm(f);
      setOriginalForm(f);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (emailCountdown <= 0) return;
    const timer = setTimeout(() => setEmailCountdown(emailCountdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [emailCountdown]);

  const startEditing = () => {
    setEditing(true);
    setOriginalForm({ ...form });
  };

  const cancelEditing = () => {
    setEditing(false);
    setForm({ ...originalForm });
    setAvatarFile(null);
    setAvatarPreview("");
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("请选择图片文件"); return; }
    if (file.size > 2 * 1024 * 1024) { toast.error("头像大小不能超过2MB"); return; }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleFieldChange = (key: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!form.nickname || String(form.nickname).trim().length < 2 || String(form.nickname).trim().length > 20) {
      toast.error("昵称需在2-20个字符之间");
      return;
    }
    setSaving(true);
    try {
      const payload: Record<string, unknown> = { ...form, nickname: String(form.nickname).trim() };
      if (avatarFile) {
        const formData = new FormData();
        formData.append("file", avatarFile);
        formData.append("folder", "avatar");
        const httpClient = (api as unknown as { _http?: { post: (url: string, data?: unknown) => Promise<unknown> } })._http;
        // Use fetch directly for multipart upload
        const token = getToken();
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "/api"}/common/upload`, {
          method: "POST", body: formData,
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const uploadData = await res.json();
        if (uploadData.code === 200 && uploadData.data) {
          payload.headPath = uploadData.data;
        }
      }
      const updated = await api.user.updateUserInfo(payload as Partial<UserProfile>);
      setProfile(updated);
      setForm({ ...form, headPath: updated.headPath || form.headPath || "" });
      toast.success("保存成功");
      setEditing(false);
      setAvatarFile(null);
      setAvatarPreview("");
    } catch (err: any) {
      toast.error(err?.message || "保存失败");
    } finally {
      setSaving(false);
    }
  };

  const openEmailDialog = () => {
    setEmailDialogOpen(true);
    setNewEmail("");
    setEmailCode("");
    setEmailDialogError("");
    setEmailCountdown(0);
  };

  const sendEmailCode = async () => {
    if (!newEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      setEmailDialogError("请输入有效的邮箱地址");
      return;
    }
    if (newEmail === profile?.email) {
      setEmailDialogError("新邮箱不能与当前邮箱相同");
      return;
    }
    setEmailCodeSending(true);
    try {
      await api.user.sendEmailCode(newEmail, "email-change");
      toast.success("验证码已发送");
      setEmailCountdown(60);
      setEmailDialogError("");
    } catch (err: any) {
      setEmailDialogError(err?.message || "发送验证码失败");
    } finally {
      setEmailCodeSending(false);
    }
  };

  const confirmEmailChange = async () => {
    if (!emailCode.trim()) { setEmailDialogError("请输入验证码"); return; }
    setSaving(true);
    try {
      const payload: Record<string, unknown> = { ...form, newEmail, emailCode: emailCode.trim() };
      const updated = await api.user.updateUserInfo(payload as Partial<UserProfile>);
      setProfile(updated);
      toast.success("邮箱修改成功");
      setEmailDialogOpen(false);
    } catch (err: any) {
      setEmailDialogError(err?.message || "修改失败");
    } finally {
      setSaving(false);
    }
  };

  const genderOptions = [
    { value: 0, label: "保密" },
    { value: 1, label: "男" },
    { value: 2, label: "女" },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-64 w-full max-w-[700px] rounded-xl" />
      </div>
    );
  }

  if (!profile) {
    return <p className="text-cosmic-muted">无法加载用户信息</p>;
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">个人信息中心</h1>
        {!editing && (
          <Button variant="outline" size="sm" onClick={startEditing}>编辑信息</Button>
        )}
      </div>

      <div className="cosmic-card p-6 max-w-[700px]">
        {/* Avatar */}
        <div className="mb-6 flex items-center gap-4">
          <div className="relative">
            <div
              className="size-20 rounded-full overflow-hidden bg-cosmic-blue/20 flex items-center justify-center ring-2 ring-cosmic-gold/30 cursor-pointer"
              onClick={() => editing && fileInputRef.current?.click()}
            >
              {avatarPreview ? (
                <img src={avatarPreview} alt="avatar" className="size-20 object-cover" />
              ) : profile.headPath ? (
                <img src={profile.headPath} alt="avatar" className="size-20 object-cover" />
              ) : (
                <span className="text-3xl font-bold text-cosmic-sky">{(profile.nickname || profile.username || "U")[0]}</span>
              )}
            </div>
            {editing && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 size-7 rounded-full bg-cosmic-blue flex items-center justify-center text-white hover:bg-cosmic-blue/80 transition-colors"
              >
                <Camera className="size-3.5" />
              </button>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
          </div>
          <div>
            <p className="font-semibold text-white">{profile.nickname || profile.username}</p>
            <p className="text-sm text-cosmic-muted">修改头像</p>
          </div>
        </div>

        {editing ? (
          /* Edit mode */
          <div className="space-y-4">
            {/* Username (disabled) */}
            <div>
              <label className="mb-1 block text-sm text-cosmic-dim">用户名</label>
              <input disabled value={profile.username || ""} className="cosmic-input w-full rounded-lg px-3 py-2 text-sm opacity-50" />
            </div>

            {/* Nickname */}
            <div>
              <label className="mb-1 block text-sm text-cosmic-dim">昵称 <span className="text-red-400">*</span></label>
              <input
                value={String(form.nickname || "")}
                onChange={(e) => handleFieldChange("nickname", e.target.value)}
                maxLength={20}
                className="cosmic-input w-full rounded-lg px-3 py-2 text-sm"
                placeholder="请输入昵称"
              />
              <span className="mt-0.5 text-xs text-cosmic-dim">{String(form.nickname || "").length}/20</span>
            </div>

            {/* Gender */}
            <div>
              <label className="mb-1 block text-sm text-cosmic-dim">性别</label>
              <div className="flex gap-4">
                {genderOptions.map((opt) => (
                  <label key={opt.value} className="flex items-center gap-1.5 text-sm text-cosmic-muted cursor-pointer">
                    <input
                      type="radio"
                      name="sex"
                      value={opt.value}
                      checked={Number(form.sex) === opt.value}
                      onChange={() => handleFieldChange("sex", opt.value)}
                      className="accent-cosmic-blue"
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Birthday */}
            <div>
              <label className="mb-1 block text-sm text-cosmic-dim">生日</label>
              <input
                type="date"
                value={String(form.birthday || "")}
                onChange={(e) => handleFieldChange("birthday", e.target.value)}
                className="cosmic-input w-full max-w-[200px] rounded-lg px-3 py-2 text-sm"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="mb-1 block text-sm text-cosmic-dim">手机号</label>
              <input
                value={String(form.phone || "")}
                onChange={(e) => handleFieldChange("phone", e.target.value)}
                className="cosmic-input w-full max-w-[300px] rounded-lg px-3 py-2 text-sm"
                placeholder="请输入手机号"
              />
            </div>

            {/* Email */}
            <div>
              <label className="mb-1 block text-sm text-cosmic-dim">邮箱</label>
              <div className="flex items-center gap-3">
                <span className="text-sm text-white">{profile.email || "未设置"}</span>
                <Button variant="ghost" size="xs" onClick={openEmailDialog} className="text-cosmic-sky hover:text-cosmic-sky/80">
                  更改邮箱
                </Button>
              </div>
            </div>

            {/* Signature */}
            <div>
              <label className="mb-1 block text-sm text-cosmic-dim">个性签名</label>
              <textarea
                value={String(form.signature || "")}
                onChange={(e) => handleFieldChange("signature", e.target.value)}
                maxLength={100}
                rows={3}
                className="cosmic-input w-full rounded-lg px-3 py-2 text-sm resize-none"
                placeholder="请输入个性签名"
              />
              <span className="mt-0.5 text-xs text-cosmic-dim">{String(form.signature || "").length}/100</span>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <Button variant="primary" onClick={handleSave} disabled={saving}>{saving ? "保存中..." : "保存修改"}</Button>
              <Button variant="ghost" onClick={cancelEditing} disabled={saving}>取消</Button>
            </div>
          </div>
        ) : (
          /* View mode */
          <div className="space-y-4">
            {[
              { label: "用户名", value: profile.username },
              { label: "昵称", value: profile.nickname },
              { label: "性别", value: genderOptions.find((g) => g.value === profile.sex)?.label || "保密" },
              { label: "生日", value: (profile as Record<string, unknown>).birthday as string || "未设置" },
              { label: "手机号", value: profile.phone || "未设置" },
            ].map((row) => (
              <div key={row.label} className="flex items-center gap-4">
                <span className="w-20 text-sm text-cosmic-dim shrink-0">{row.label}</span>
                <span className="text-sm text-white">{row.value || "未设置"}</span>
              </div>
            ))}
            <div className="flex items-center gap-4">
              <span className="w-20 text-sm text-cosmic-dim shrink-0">邮箱</span>
              <span className="text-sm text-white">{profile.email || "未设置"}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="w-20 text-sm text-cosmic-dim shrink-0">个性签名</span>
              <span className="text-sm text-cosmic-muted">{profile.signature || "未设置"}</span>
            </div>
          </div>
        )}
      </div>

      {/* Email Change Dialog */}
      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent className="!max-w-sm">
          <DialogTitle>更改邮箱</DialogTitle>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm text-cosmic-dim">当前邮箱</label>
              <p className="text-sm text-white">{profile.email || "未设置"}</p>
              <p className="mt-1 text-xs text-cosmic-dim">本月剩余修改次数：{emailRemaining}/2</p>
            </div>

            <div>
              <label className="mb-1 block text-sm text-cosmic-dim">新邮箱</label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => { setNewEmail(e.target.value); setEmailDialogError(""); }}
                className="cosmic-input w-full rounded-lg px-3 py-2 text-sm"
                placeholder="请输入新邮箱"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-cosmic-dim">验证码</label>
              <div className="flex gap-2">
                <input
                  value={emailCode}
                  onChange={(e) => { setEmailCode(e.target.value); setEmailDialogError(""); }}
                  className="cosmic-input flex-1 rounded-lg px-3 py-2 text-sm"
                  placeholder="6位验证码"
                  maxLength={6}
                />
                <Button variant="outline" size="sm" onClick={sendEmailCode} disabled={emailCountdown > 0 || emailCodeSending}>
                  {emailCountdown > 0 ? `${emailCountdown}s` : emailCodeSending ? "发送中..." : "发送验证码"}
                </Button>
              </div>
            </div>

            {emailDialogError && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400 flex items-center gap-2">
                <AlertCircle className="size-4 shrink-0" />
                {emailDialogError}
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <DialogClose asChild>
                <Button variant="ghost" size="sm">取消</Button>
              </DialogClose>
              <Button variant="primary" size="sm" onClick={confirmEmailChange} disabled={saving || emailRemaining <= 0}>
                {saving ? "确认中..." : "确认修改"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
