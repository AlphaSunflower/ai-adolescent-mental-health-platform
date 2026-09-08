"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check, Clock, X, FileText, UserCheck, MessageSquare, Award } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/pouf/Button";
import { Skeleton } from "@/components/pouf/Skeleton";
import { Card } from "@/components/pouf/Card";
import { api } from "@/lib/api";

const STEPS = [
  { key: "FILLING", label: "填写资料", icon: FileText },
  { key: "REVIEWING", label: "资质审核", icon: UserCheck },
  { key: "PAPER", label: "笔试考核", icon: FileText },
  { key: "REPORT", label: "案例评估", icon: MessageSquare },
  { key: "INTERVIEW", label: "面试评估", icon: UserCheck },
  { key: "APPROVED", label: "入驻成功", icon: Award },
];

const STEP_ORDER = ["FILLING", "REVIEWING", "PAPER", "REPORT", "INTERVIEW", "APPROVED"];

const RESULT_LABELS: Record<string, string> = {
  paperResult: "笔试结果",
  reportResult: "案例报告评估",
  interviewResult: "面试评估",
};

function resultText(result: number | undefined): { label: string; color: string } {
  if (result === 1) return { label: "通过", color: "text-mint" };
  if (result === 0) return { label: "未通过", color: "text-pink" };
  if (result === -1) return { label: "审核中", color: "text-yellow" };
  return { label: "待处理", color: "text-muted/70" };
}

export function ApplyStatusPage() {
  const router = useRouter();
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const detail = await api.psychologistApply.detail();
        setData(detail);
      } catch (err) {
        setError(err instanceof Error ? err.message : "加载失败");
      }
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 md:py-12">
        <Skeleton className="mb-4 h-5 w-24" />
        <Skeleton className="mb-8 h-64 w-full" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <p className="text-lg text-muted">{error || "暂无申请记录"}</p>
        <Link href="/apply" className="mt-4 inline-block text-blue hover:underline">
          返回申请首页
        </Link>
      </div>
    );
  }

  const status = (data.status as string) || "FILLING";
  const step = (data.step as string) || "FILLING";
  const currentStepIdx = STEP_ORDER.indexOf(String(status).toUpperCase());
  const statusName = (data.statusName as string) || STEPS.find((s) => s.key === status)?.label || "填写资料";
  const rejectReason = data.rejectReason as string | undefined;
  const interviewTime = data.interviewTime as string | undefined;
  const interviewLocation = data.interviewLocation as string | undefined;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 md:py-12">
      <Link
        href="/apply"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted hover:text-purple transition-colors"
      >
        <ArrowLeft className="size-4" /> 返回申请首页
      </Link>

      <h1 className="mb-2 text-2xl font-black text-ink">申请状态</h1>
      <p className="mb-8 text-sm text-muted">当前状态：{statusName}</p>

      {/* Steps progress */}
      <Card className="mb-6 p-6">
        <div className="space-y-0">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isCompleted = currentStepIdx >= 0 && i < currentStepIdx;
            const isCurrent = STEP_ORDER[i] === (status === "REJECTED" ? step : status);
            const isRejected = status === "REJECTED" && i === currentStepIdx;

            return (
              <div key={s.key} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex size-9 items-center justify-center rounded-full text-sm ${
                      isCompleted
                        ? "bg-mint/20 text-mint"
                        : isRejected
                          ? "bg-pink/20 text-pink"
                          : isCurrent
                            ? "bg-purple/20 text-blue ring-2 ring-blue/50"
                            : "bg-purple/10 text-muted/70"
                    }`}
                  >
                    {isCompleted ? <Check className="size-4" /> : isRejected ? <X className="size-4" /> : s.key === "FILLING" && isCurrent ? <Clock className="size-4" /> : <Icon className="size-4" />}
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`mt-1 h-8 w-0.5 ${isCompleted ? "bg-mint/30" : "bg-purple/10"}`} />
                  )}
                </div>
                <div className="pb-6">
                  <p className={`text-sm font-medium ${isCurrent ? "text-blue" : isCompleted ? "text-mint" : "text-muted/70"}`}>
                    {s.label}
                  </p>
                  {isRejected && rejectReason && (
                    <p className="mt-1 text-xs text-pink">驳回原因：{rejectReason}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Results */}
      {(["paperResult", "reportResult", "interviewResult"] as const).map((key) => {
        const val = data[key] as number | undefined;
        if (val === undefined) return null;
        const r = resultText(val);
        return (
          <Card key={key} className="mb-3 p-4 flex items-center justify-between">
            <span className="text-sm text-ink">{RESULT_LABELS[key]}</span>
            <span className={`text-sm font-semibold ${r.color}`}>{r.label}</span>
          </Card>
        );
      })}

      {/* Interview info */}
      {interviewTime && (
        <Card className="mb-3 p-4">
          <p className="text-sm text-ink">面试时间：{interviewTime}</p>
          {interviewLocation && <p className="mt-1 text-sm text-muted">地点：{interviewLocation}</p>}
        </Card>
      )}

      {/* Continue button */}
      {(status === "FILLING" || status === "REVIEWING" || step === "REPORT") && status !== "REJECTED" && (
        <div className="mt-6 text-center">
          <Button tone="purple" onClick={() => router.push("/apply/form")}>
            {status === "FILLING" ? "继续填写申请" : "继续申请"}
          </Button>
        </div>
      )}
    </div>
  );
}
