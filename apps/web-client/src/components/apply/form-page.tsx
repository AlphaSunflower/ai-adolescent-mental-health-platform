"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Upload, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { api, httpClient } from "@/lib/api";
import { getToken } from "@/lib/session";

const BASIC_FIELDS: { name: string; label: string; type: string; required?: boolean; placeholder?: string }[] = [
  { name: "realName", label: "真实姓名", type: "text", required: true, placeholder: "请输入真实姓名" },
  { name: "phone", label: "联系电话", type: "tel", required: true, placeholder: "请输入联系电话" },
  { name: "country", label: "所在国家/地区", type: "text", placeholder: "如：中国" },
  { name: "contactWechat", label: "微信号", type: "text", required: true, placeholder: "请输入微信号" },
  { name: "caseHours", label: "个案小时数", type: "text", placeholder: "如：500" },
  { name: "supervisionHours", label: "督导小时数", type: "text", placeholder: "如：100" },
  { name: "consultationPrice", label: "咨询价格（元）", type: "number", placeholder: "如：300" },
  { name: "education", label: "教育背景", type: "text", required: true, placeholder: "如：心理学硕士" },
];

const PROOF_CATEGORIES = [
  { key: "qualificationUrls", label: "资质证书" },
  { key: "supervisionProofUrls", label: "督导证明" },
  { key: "experienceProofUrls", label: "经验证明" },
  { key: "otherProofUrls", label: "其他证明" },
];

export function ApplyFormPage() {
  const router = useRouter();
  const [step, setStep] = useState<"basic" | "report">("basic");
  const [form, setForm] = useState<Record<string, string>>({});
  const [resumeUrl, setResumeUrl] = useState("");
  const [proofs, setProofs] = useState<Record<string, string[]>>({
    qualificationUrls: [],
    supervisionProofUrls: [],
    experienceProofUrls: [],
    otherProofUrls: [],
  });
  const [selfNarration, setSelfNarration] = useState("");
  const [uploading, setUploading] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [eligibility, status] = await Promise.all([
          api.psychologistApply.check(),
          api.psychologistApply.status(),
        ]);
        const s = (status as Record<string, unknown>).status as string;
        const step = (status as Record<string, unknown>).step as string;
        if (s === "REVIEWING" || s === "PAPER" || s === "REPORT" || s === "INTERVIEW" || s === "APPROVED") {
          router.replace("/apply/status");
          return;
        }
        if (step === "REPORT" || s === "REPORT") setStep("report");
        const eligible = (eligibility as Record<string, unknown>).eligible;
        if (!eligible) {
          toast.error((eligibility as Record<string, unknown>).reason as string || "暂不符合申请条件");
        }
      } catch { /* ignore */ }
      setChecking(false);
    })();
  }, [router]);

  const set = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const uploadFile = async (file: File, type: string): Promise<string | null> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);
    const token = getToken();
    const res = await httpClient.raw.post("/psychologist-apply/upload", formData, {
      headers: { "Content-Type": "multipart/form-data", ...(token ? { Authorization: `Bearer ${token}`, token } : {}) },
    });
    const data = res.data as { code: number; data: string; message?: string };
    if (data.code === 200) return data.data;
    toast.error(data.message || "上传失败");
    return null;
  };

  const handleFileUpload = async (category: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(category);
    const url = await uploadFile(file, category);
    if (url) {
      setProofs((prev) => ({ ...prev, [category]: [...prev[category], url] }));
      toast.success("上传成功");
    }
    setUploading("");
  };

  const removeProof = (category: string, idx: number) => {
    setProofs((prev) => ({ ...prev, [category]: prev[category].filter((_, i) => i !== idx) }));
  };

  const handleSubmitBasic = async () => {
    if (!form.realName?.trim()) { toast.error("请输入真实姓名"); return; }
    if (!form.phone?.trim()) { toast.error("请输入联系电话"); return; }
    if (!form.contactWechat?.trim()) { toast.error("请输入微信号"); return; }
    if (!form.education?.trim()) { toast.error("请输入教育背景"); return; }
    setSubmitting(true);
    try {
      await api.psychologistApply.submitBasic({ ...form, resumeUrl: resumeUrl || undefined });
      toast.success("基本信息提交成功");
      setStep("report");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "提交失败");
    }
    setSubmitting(false);
  };

  const handleSubmitReport = async () => {
    if (!selfNarration.trim()) { toast.error("请填写个案报告"); return; }
    setSubmitting(true);
    try {
      await api.psychologistApply.submitReport({
        ...proofs,
        selfNarration,
      });
      toast.success("报告提交成功");
      router.push("/apply/status");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "提交失败");
    }
    setSubmitting(false);
  };

  if (checking) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <p className="text-cosmic-muted">检查申请状态...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 md:py-12">
      <Link href="/apply" className="mb-6 inline-flex items-center gap-1 text-sm text-cosmic-muted hover:text-cosmic-sky transition-colors">
        <ArrowLeft className="size-4" /> 返回申请首页
      </Link>

      <h1 className="cosmic-gradient-text mb-2 text-2xl font-bold">咨询师申请</h1>

      {/* Step indicator */}
      <div className="mb-8 flex items-center gap-3">
        {["basic", "report"].map((s, i) => (
          <div key={s} className="flex items-center gap-3">
            <div className={`flex items-center gap-2 text-sm ${step === s ? "text-cosmic-sky font-semibold" : step === "report" && i === 0 ? "text-green-400" : "text-cosmic-dim"}`}>
              <span className={`flex size-7 items-center justify-center rounded-full text-xs font-bold ${
                step === s ? "bg-cosmic-blue/30 text-cosmic-sky" : step === "report" && i === 0 ? "bg-green-400/20 text-green-400" : "bg-white/5 text-cosmic-dim"
              }`}>
                {step === "report" && i === 0 ? <Check className="size-3.5" /> : i + 1}
              </span>
              {s === "basic" ? "基本信息" : "案例报告"}
            </div>
            {i === 0 && <div className="h-px w-12 bg-white/10" />}
          </div>
        ))}
      </div>

      {step === "basic" && (
        <div className="cosmic-card space-y-5 p-6">
          {BASIC_FIELDS.map((f) => (
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
              {uploading === "resume" ? "上传中..." : resumeUrl ? "已上传" : "点击上传简历文件"}
              <input type="file" accept=".pdf,.doc,.docx" onChange={async (e) => { const f = (e.target as HTMLInputElement).files?.[0]; if (!f) return; setUploading("resume"); const url = await uploadFile(f, "resume"); if (url) setResumeUrl(url); setUploading(""); }} disabled={uploading === "resume"} className="hidden" />
            </label>
            {resumeUrl && <p className="mt-1 text-xs text-green-400">简历已上传</p>}
          </div>

          <Button variant="primary" className="w-full" onClick={handleSubmitBasic} disabled={submitting}>
            {submitting ? "提交中..." : "下一步：案例报告"}
          </Button>
        </div>
      )}

      {step === "report" && (
        <div className="cosmic-card space-y-5 p-6">
          <p className="text-sm text-cosmic-muted">请上传相关证明材料，并撰写个案报告</p>

          {PROOF_CATEGORIES.map((cat) => (
            <div key={cat.key}>
              <label className="mb-1.5 block text-sm font-medium text-cosmic-header">{cat.label}</label>
              {proofs[cat.key].length > 0 && (
                <div className="mb-2 space-y-1">
                  {proofs[cat.key].map((url, idx) => (
                    <div key={idx} className="flex items-center justify-between rounded bg-white/5 px-3 py-1.5 text-xs text-cosmic-muted">
                      <span className="truncate">{url.split("/").pop() || `文件 ${idx + 1}`}</span>
                      <button onClick={() => removeProof(cat.key, idx)} className="text-red-400 hover:text-red-300 ml-2 shrink-0">删除</button>
                    </div>
                  ))}
                </div>
              )}
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-white/20 p-3 text-sm text-cosmic-muted hover:border-cosmic-sky/50 transition-colors">
                <Upload className="size-4" />
                {uploading === cat.key ? "上传中..." : `上传${cat.label}`}
                <input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={(e) => handleFileUpload(cat.key, e)} disabled={uploading === cat.key} className="hidden" />
              </label>
            </div>
          ))}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-cosmic-header">
              个案报告 <span className="text-red-400">*</span>
            </label>
            <textarea
              value={selfNarration}
              onChange={(e) => setSelfNarration(e.target.value)}
              placeholder="请详细描述您的个案经验、咨询方法和反思..."
              rows={6}
              className="cosmic-input w-full rounded-lg px-3 py-2 text-sm resize-y"
            />
          </div>

          <Button variant="primary" className="w-full" onClick={handleSubmitReport} disabled={submitting}>
            {submitting ? "提交中..." : "提交申请"}
          </Button>
        </div>
      )}
    </div>
  );
}
