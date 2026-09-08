"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ClipboardCheck, Clock, FileText, ArrowLeft, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/pouf/Tabs";
import { Button } from "@/components/pouf/Button";
import { Progress } from "@/components/pouf/Progress";
import { Skeleton } from "@/components/pouf/Skeleton";
import { Badge } from "@/components/pouf/Badge";
import { Card } from "@/components/pouf/Card";
import { api } from "@/lib/api";
import type { AssessmentTemplate, AssessmentRecord, AssessmentRiskLevel } from "@/lib/types";

const RISK_TONE: Record<AssessmentRiskLevel, "gold" | "warning" | "destructive" | "secondary"> = {
  "日常筛查": "secondary",
  "情绪压力": "warning",
  "睡眠关注": "gold",
  "亲子关系": "secondary",
};

function AssessmentTemplatesTab({ onStart }: { onStart: (template: AssessmentTemplate) => void }) {
  const [templates, setTemplates] = useState<AssessmentTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.assessment.templates()
      .then(setTemplates)
      .catch(() => toast.error("加载测评模板失败"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="p-5">
            <Skeleton className="mb-3 h-5 w-20" />
            <Skeleton className="mb-2 h-6 w-3/4" />
            <Skeleton className="mb-1 h-4 w-full" />
            <Skeleton className="h-4 w-1/2" />
          </Card>
        ))}
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="py-20 text-center text-muted">
        <ClipboardCheck className="mx-auto mb-4 size-12 opacity-30" />
        <p>暂无可用测评模板</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {templates.map((t) => (
        <Card
          key={t.id}
          className="group cursor-pointer p-5 transition-all duration-300 hover:-translate-y-1"
          onClick={() => onStart(t)}
        >
          <Badge variant={RISK_TONE[t.riskLevel]} className="mb-3">
            {t.riskLevel}
          </Badge>
          <h3 className="mb-2 font-black text-ink transition-colors group-hover:text-purple">
            {t.title}
          </h3>
          <p className="mb-3 line-clamp-2 text-sm font-bold text-muted">{t.description}</p>
          <div className="flex items-center gap-4 text-xs font-bold text-muted/70">
            <span className="inline-flex items-center gap-1">
              <FileText className="size-3" />
              {t.questionCount} 题
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3" />
              约 {t.duration}
            </span>
          </div>
        </Card>
      ))}
    </div>
  );
}

function AssessmentQuestionForm({
  template,
  onSubmit,
  submitting,
}: {
  template: AssessmentTemplate;
  onSubmit: (answers: Record<string, number>) => void;
  submitting: boolean;
}) {
  const questions = template.questions ?? [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const progress = questions.length > 0 ? ((Object.keys(answers).length) / questions.length) * 100 : 0;

  const currentQuestion = questions[currentIndex];
  const hasAnswered = currentQuestion ? answers[currentQuestion.id] !== undefined : false;

  const selectOption = (questionId: string, value: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const goNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  if (questions.length === 0) {
    return (
      <div className="py-20 text-center text-muted">
        <AlertCircle className="mx-auto mb-4 size-12 opacity-30" />
        <p>该测评暂无题目</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between text-sm font-bold text-muted">
          <span>第 {currentIndex + 1} / {questions.length} 题</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} tone="purple" className="h-1.5" />
      </div>

      <Card className="p-6 md:p-8">
        <h3 className="mb-6 text-lg font-black text-ink">
          {currentIndex + 1}. {currentQuestion.title}
        </h3>

        <div className="space-y-3">
          {(currentQuestion.options ?? []).map((option) => {
            const isSelected = answers[currentQuestion.id] === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => selectOption(currentQuestion.id, option.value)}
                className={`w-full rounded-control border px-4 py-3 text-left text-sm font-bold transition-all ${
                  isSelected
                    ? "border-purple/50 bg-purple/10 text-ink"
                    : "border-[rgba(201,168,255,0.3)] bg-surface text-muted hover:border-purple/40 hover:bg-purple/5"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        <div className="mt-8 flex items-center justify-between">
          <Button
            tone="purple"
            variant="quiet"
            size="sm"
            onClick={goPrev}
            disabled={currentIndex === 0}
          >
            上一题
          </Button>

          {currentIndex < questions.length - 1 ? (
            <Button
              tone="purple"
              size="sm"
              onClick={goNext}
              disabled={!hasAnswered}
            >
              下一题
            </Button>
          ) : (
            <Button
              tone="purple"
              size="sm"
              disabled={!hasAnswered || submitting}
              onClick={() => onSubmit(answers)}
            >
              {submitting ? "提交中..." : "提交"}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}

function AssessmentHistoryTab() {
  const [records, setRecords] = useState<AssessmentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.assessment.records()
      .then((r) => setRecords(r.records))
      .catch(() => toast.error("加载测评历史失败"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="p-4">
            <Skeleton className="mb-2 h-5 w-40" />
            <Skeleton className="mb-1 h-4 w-full" />
            <Skeleton className="h-4 w-1/2" />
          </Card>
        ))}
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="py-20 text-center text-muted">
        <FileText className="mx-auto mb-4 size-12 opacity-30" />
        <p>暂无测评记录</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {records.map((r) => (
        <Card key={r.id} className="p-4 transition-all hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-ink">{r.title}</h3>
            <span className="text-sm font-bold text-muted/70">{r.createTime}</span>
          </div>
          <div className="mt-2 flex items-center gap-4 text-sm">
            <span className="font-black text-purple">得分: {r.score}</span>
            <span className="font-bold text-muted">{r.result}</span>
          </div>
        </Card>
      ))}
    </div>
  );
}

export function AssessmentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") ?? "templates";
  const [tab, setTab] = useState(initialTab);
  const [activeTemplate, setActiveTemplate] = useState<AssessmentTemplate | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleTabChange = (value: string) => {
    setTab(value);
    setActiveTemplate(null);
    const params = new URLSearchParams(searchParams.toString());
    if (value === "templates") {
      params.delete("tab");
    } else {
      params.set("tab", value);
    }
    router.replace(`/assessment?${params.toString()}`, { scroll: false });
  };

  const handleStart = (template: AssessmentTemplate) => {
    setActiveTemplate(template);
    setTab("taking");
  };

  const handleSubmit = async (answers: Record<string, number>) => {
    if (!activeTemplate) return;
    setSubmitting(true);
    try {
      const result = await api.assessment.submit(activeTemplate.id, answers);
      toast.success("测评提交成功");
      setActiveTemplate(null);
      setTab("history");
    } catch {
      toast.error("提交失败，请重试");
    } finally {
      setSubmitting(false);
    }
  };

  if (activeTemplate && tab === "taking") {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 md:py-12">
        <button
          type="button"
          onClick={() => { setActiveTemplate(null); setTab("templates"); }}
          className="mb-6 inline-flex items-center gap-1 text-sm font-bold text-muted transition-colors hover:text-purple"
        >
          <ArrowLeft className="size-4" />
          返回测评列表
        </button>
        <h1 className="mb-2 text-2xl font-black text-ink">{activeTemplate.title}</h1>
        <p className="mb-8 text-sm font-bold text-muted">{activeTemplate.description}</p>
        <AssessmentQuestionForm
          template={activeTemplate}
          onSubmit={handleSubmit}
          submitting={submitting}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:py-12">
      <h1 className="mb-8 text-2xl font-black text-ink">心理测评</h1>

      <Tabs value={tab} onValueChange={handleTabChange}>
        <TabsList className="mb-8">
          <TabsTrigger value="templates">测评列表</TabsTrigger>
          <TabsTrigger value="history">测评历史</TabsTrigger>
        </TabsList>

        <TabsContent value="templates">
          <AssessmentTemplatesTab onStart={handleStart} />
        </TabsContent>

        <TabsContent value="history">
          <AssessmentHistoryTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
