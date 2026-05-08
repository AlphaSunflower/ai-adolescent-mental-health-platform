"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { api, httpClient } from "@/lib/api";
import { getToken } from "@/lib/session";

const FIELDS: { name: string; label: string; type: string; required?: boolean; placeholder?: string }[] = [
  { name: "realName", label: "真实姓名", type: "text", required: true, placeholder: "请输入真实姓名" },
  { name: "phone", label: "联系电话", type: "tel", required: true, placeholder: "请输入联系电话" },
  { name: "country", label: "所在国家/地区", type: "text", placeholder: "如：中国" },
  { name: "contactWechat", label: "微信号", type: "text", required: true, placeholder: "请输入微信号" },
  { name: "caseHours", label: "个案小时数", type: "text", placeholder: "如：500" },
  { name: "supervisionHours", label: "督导小时数", type: "text", placeholder: "如：100" },
  { name: "consultationPrice", label: "咨询价格（元）", type: "number", placeholder: "如：300" },
  { name: "education", label: "教育背景", type: "text", required: true, placeholder: "如：心理学硕士" },
];

export function ApplyBasicPage() {
  const router = useRouter();
  const [form, setForm] = useState<Record<string, string>>({});
  const [resumeUrl, setResumeUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const set = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "resume");
      const token = getToken();
      const res = await httpClient.raw.post("/psychologist-apply/upload", formData, {
        headers: { "Content-Type": "multipart/form-data", ...(token ? { Authorization: `Bearer ${token}`, token } : {}) },
      });
      const data = res.data as { code: number; data: string; message?: string };
      if (data.code === 200) {
        setResumeUrl(data.data);
        toast.success("上传成功");
      } else {
        toast.error(data.message || "上传失败");
      }
    } catch {
      toast.error("上传失败，请重试");
    }
    setUploading(false);
  };

  const handleSubmit = async () => {
    if (!form.realName?.trim()) { toast.error("请输入真实姓名"); return; }
    if (!form.phone?.trim()) { toast.error("请输入联系电话"); return; }
    if (!form.contactWechat?.trim()) { toast.error("请输入微信号"); return; }
    if (!form.education?.trim()) { toast.error("请输入教育背景"); return; }
    setSubmitting(true);
    try {
      await api.psychologistApply.submitBasic({ ...form, resumeUrl: resumeUrl || undefined });
      toast.success("基本信息提交成功");
      router.push("/apply/status");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "提交失败");
    }
    setSubmitting(false);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 md:py-12">
      <Link href="/apply" className="mb-6 inline-flex items-center gap-1 text-sm text-cosmic-muted hover:text-cosmic-sky transition-colors">
        <ArrowLeft className="size-4" /> 返回申请首页
      </Link>

      <h1 className="cosmic-gradient-text mb-2 text-2xl font-bold">基本信息</h1>
      <p className="mb-8 text-sm text-cosmic-muted">请填写您的基本信息，带 * 为必填项</p>

      <div className="cosmic-card space-y-5 p-6">
        {FIELDS.map((f) => (
          <div key={f.name}>
            <label className="mb-1.5 block text-sm font-medium text-cosmic-header">
              {f.label}{f.required && <span className="text-red-400 ml-0.5">*</span>}
            </label>
            <input
              type={f.type}
              value={form[f.name] || ""}
              onChange={(e) => set(f.name, e.target.value)}
              placeholder={f.placeholder}
              className="cosmic-input w-full rounded-lg px-3 py-2 text-sm"
            />
          </div>
        ))}

        <div>
          <label className="mb-1.5 block text-sm font-medium text-cosmic-header">简历上传</label>
          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-white/20 p-4 text-sm text-cosmic-muted hover:border-cosmic-sky/50 transition-colors">
            <Upload className="size-4" />
            {uploading ? "上传中..." : resumeUrl ? "已上传" : "点击上传简历文件"}
            <input type="file" accept=".pdf,.doc,.docx" onChange={handleUpload} disabled={uploading} className="hidden" />
          </label>
          {resumeUrl && <p className="mt-1 text-xs text-green-400">简历已上传</p>}
        </div>

        <Button variant="primary" className="w-full" onClick={handleSubmit} disabled={submitting}>
          {submitting ? "提交中..." : "提交基本信息"}
        </Button>
      </div>
    </div>
  );
}
