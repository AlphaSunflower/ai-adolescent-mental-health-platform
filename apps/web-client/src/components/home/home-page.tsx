"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bot, Calendar, ClipboardCheck, BookOpen, Heart, Sparkles,
  ChevronRight, MessageCircle, ArrowRight, Sprout,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import type { Appointment, AssessmentRecord, AiMessage, LibraryItem } from "@/lib/types";

const DEFAULT_QUOTES = [
  { content: "每一种情绪都值得被看见，每一个你都值得被温柔以待。", author: "心愈智联" },
  { content: "你不必独自面对一切，我们在这里陪伴你。", author: "心愈智联" },
  { content: "成长是一场旅行，心理健康是最好的行囊。", author: "心愈智联" },
  { content: "倾听内心的声音，那是你最真实的力量。", author: "心愈智联" },
];

const SHORTCUTS = [
  { href: "/ai", label: "AI 咨询室", desc: "24 小时陪伴对话", icon: Bot, color: "text-green-400", bg: "bg-green-500/20" },
  { href: "/consultation", label: "心理咨询预约", desc: "与专业咨询师对话", icon: Calendar, color: "text-yellow-400", bg: "bg-yellow-500/20" },
  { href: "/assessment", label: "心理评估", desc: "了解你的心理状态", icon: ClipboardCheck, color: "text-blue-400", bg: "bg-blue-500/20" },
  { href: "/library", label: "内容馆", desc: "文章 · 课程 · 书籍", icon: BookOpen, color: "text-purple-400", bg: "bg-purple-500/20" },
  { href: "/me", label: "我的照护计划", desc: "定制成长方案", icon: Heart, color: "text-rose-400", bg: "bg-rose-500/20" },
];

const CARE_PLAN = [
  { title: "继续 AI 对话", status: "进行中", accent: "green" as const },
  { title: "预约专业咨询", status: "待开始", accent: "purple" as const },
  { title: "完成一次测评", status: "待开始", accent: "yellow" as const },
  { title: "阅读支持内容", status: "进行中", accent: "coral" as const },
];

function formatToday() {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(new Date());
}

export function HomePage() {
  const router = useRouter();

  // Daily quote
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const quotes = DEFAULT_QUOTES;

  // Data
  const [nickname, setNickname] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [latestAppointment, setLatestAppointment] = useState<Appointment | null>(null);
  const [latestAssessment, setLatestAssessment] = useState<AssessmentRecord | null>(null);
  const [latestAiReply, setLatestAiReply] = useState<string>("");
  const [recommendations, setRecommendations] = useState<LibraryItem[]>([]);

  // Quote rotation
  useEffect(() => {
    const timer = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setQuoteIndex((prev) => (prev + 1) % quotes.length);
        setFade(true);
      }, 500);
    }, 6000);
    return () => clearInterval(timer);
  }, [quotes.length]);

  // Data fetching
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profile, appointmentRes, assessmentRes, sessions] = await Promise.all([
          api.user.getUserInfo(),
          api.appointment.my().catch(() => ({ records: [] })),
          api.assessment.records().catch(() => ({ records: [] as AssessmentRecord[] })),
          api.ai.sessions().catch(() => []),
        ]);

        setNickname(profile.nickname || profile.username || "用户");
        setLatestAppointment(appointmentRes.records[0] ?? null);
        setLatestAssessment(assessmentRes.records[0] ?? null);

        // Latest AI reply
        const firstSession = sessions[0];
        if (firstSession) {
          try {
            const msgs = await api.ai.messages(firstSession.id);
            const lastReply = [...msgs].reverse().find((m) => m.role === "assistant");
            if (lastReply) setLatestAiReply(lastReply.content);
          } catch { /* ignore */ }
        }

        // Recommendations
        const contentResults = await Promise.allSettled([
          api.content.articles({ page: 1, size: 4 }),
          api.content.courses({ page: 1, size: 4 }),
          api.content.books({ page: 1, size: 4 }),
          api.content.communityArticles({ page: 1, size: 4 }),
        ]);
        const merged = contentResults.flatMap((r) =>
          r.status === "fulfilled" ? r.value.records : [],
        );
        setRecommendations(merged.slice(0, 3));
      } catch { /* use defaults */ } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const currentQuote = quotes[quoteIndex];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:py-12">

      {/* Row 1: Greeting + Daily Quote */}
      <section className="mb-10 grid gap-6 lg:grid-cols-[1fr_400px] lg:items-center">
        <div>
          <h1 className="text-3xl font-semibold text-white md:text-4xl">
            {loading ? <Skeleton className="inline-block h-9 w-48" /> : <>你好，{nickname} <Sprout className="inline size-8 text-green-400" /></>}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-cosmic-muted">
            <span>今天是 {formatToday()}</span>
            <span className="h-4 w-px bg-white/10" />
            <span>关注自己，从一个小行动开始</span>
          </div>
        </div>

        <Card className="cosmic-card relative overflow-hidden border-cosmic-gold/20">
          <CardContent className="py-6 text-center">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-cosmic-gold/10 px-3 py-1 text-xs text-cosmic-gold">
              <Sparkles className="size-3" /> 每日一语
            </div>
            <blockquote
              className={`mx-auto max-w-sm text-lg italic text-white transition-all duration-500 ${
                fade ? "opacity-100 translate-y-0" : "opacity-0 translate-y-[-6px]"
              }`}
            >
              &ldquo;{currentQuote.content}&rdquo;
            </blockquote>
            {currentQuote.author && (
              <cite className="mt-2 block text-xs text-cosmic-muted not-italic">
                — {currentQuote.author}
              </cite>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Row 2: Quick Actions */}
      <section className="mb-10">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {SHORTCUTS.map((item) => (
            <Link key={item.href} href={item.href}>
              <Card className="cosmic-card group cursor-pointer p-5 transition-all duration-300 hover:-translate-y-1">
                <div className={`mb-3 inline-flex rounded-xl ${item.bg} p-2.5`}>
                  <item.icon className={`size-5 ${item.color}`} />
                </div>
                <h3 className="mb-1 font-semibold text-white">{item.label}</h3>
                <p className="text-xs text-cosmic-muted">{item.desc}</p>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Row 3: Three-column content */}
      <section className="mb-10 grid gap-5 lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_280px_300px]">
        {/* Left: AI 咨询室 */}
        <Card className="cosmic-card flex min-h-[320px] flex-col">
          <CardContent className="flex flex-1 flex-col p-5">
            <div className="mb-4 flex items-center gap-2">
              <MessageCircle className="size-5 text-cosmic-sky" />
              <h3 className="font-semibold text-white">AI 咨询室</h3>
              <span className="text-xs text-cosmic-dim">· 最新对话</span>
              <Link href="/ai" className="ml-auto">
                <Button variant="ghost" size="xs">
                  进入 <ChevronRight className="size-3" />
                </Button>
              </Link>
            </div>

            <div className="flex flex-1 flex-col justify-between">
              {loading ? (
                <Skeleton className="h-24 w-full rounded-xl" />
              ) : latestAiReply ? (
                <div className="flex-1 rounded-xl bg-white/5 p-4">
                  <p className="text-sm leading-relaxed text-cosmic-muted line-clamp-4">
                    {latestAiReply}
                  </p>
                </div>
              ) : (
                <div className="flex flex-1 items-center justify-center text-sm text-cosmic-dim">
                  还没有 AI 会话记录
                </div>
              )}

              <button
                type="button"
                onClick={() => router.push("/ai")}
                className="mt-4 w-full rounded-xl bg-white/5 px-4 py-3 text-left text-sm text-cosmic-dim hover:bg-white/10 transition-colors"
              >
                把现在最困扰你的事写下来...
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Middle: Appointments + Assessments */}
        <div className="flex flex-col gap-5 xl:col-span-1 lg:col-span-1">
          {/* Recent Appointment */}
          <Card className="cosmic-card">
            <CardContent className="p-5">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="flex items-center gap-2 font-semibold text-white">
                  <Calendar className="size-4 text-cosmic-sky" />
                  近期预约
                </h3>
                <Link href="/me/psychology">
                  <Button variant="ghost" size="xs">
                    全部 <ArrowRight className="ml-1 size-3" />
                  </Button>
                </Link>
              </div>

              {loading ? (
                <Skeleton className="h-16 w-full rounded-lg" />
              ) : latestAppointment ? (
                <div className="rounded-lg bg-white/5 p-3">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-white text-sm">{latestAppointment.psychologistName}</p>
                    <Badge variant="secondary" className="text-xs">{latestAppointment.status}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-cosmic-dim">
                    {latestAppointment.date} {latestAppointment.time} · {latestAppointment.type}
                  </p>
                </div>
              ) : (
                <div className="py-4 text-center text-xs text-cosmic-dim">暂无近期预约</div>
              )}
            </CardContent>
          </Card>

          {/* Latest Assessment */}
          <Card className="cosmic-card">
            <CardContent className="p-5">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="flex items-center gap-2 font-semibold text-white">
                  <ClipboardCheck className="size-4 text-cosmic-sky" />
                  心理评估记录
                </h3>
                <Link href="/me/assessments">
                  <Button variant="ghost" size="xs">
                    全部 <ArrowRight className="ml-1 size-3" />
                  </Button>
                </Link>
              </div>

              {loading ? (
                <Skeleton className="h-20 w-full rounded-lg" />
              ) : latestAssessment ? (
                <div>
                  <p className="font-medium text-white text-sm">{latestAssessment.title}</p>
                  <div className="mt-3 flex items-center gap-3">
                    <Progress value={Math.min(latestAssessment.score, 100)} className="h-2 flex-1" />
                    <span className="text-sm font-bold text-cosmic-gold">{latestAssessment.score} 分</span>
                  </div>
                  <p className="mt-3 text-xs leading-5 text-cosmic-muted line-clamp-2">
                    {latestAssessment.result}
                  </p>
                </div>
              ) : (
                <div className="py-4 text-center text-xs text-cosmic-dim">暂无测评记录</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Recommendations */}
        <Card className="cosmic-card lg:col-span-2 xl:col-span-1">
          <CardContent className="p-5">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="size-4 text-cosmic-gold" />
              <h3 className="font-semibold text-white">为你推荐</h3>
            </div>

            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full rounded-lg" />
                ))}
              </div>
            ) : recommendations.length ? (
              <div className="space-y-3">
                {recommendations.map((item) => (
                  <Link
                    key={`${item.type}-${item.id}`}
                    href={item.type === "书籍" ? `/library/book/${item.id}` : item.type === "社区" && item.authorId ? `/user/${item.authorId}/article/${item.id}` : `/library/article/${item.id}`}
                  >
                    <div className="group rounded-lg bg-white/5 p-3 transition-colors hover:bg-white/10">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs shrink-0">{item.type}</Badge>
                        <p className="text-sm font-medium text-white group-hover:text-cosmic-sky transition-colors line-clamp-1">
                          {item.title}
                        </p>
                      </div>
                      <p className="mt-1 text-xs text-cosmic-muted line-clamp-2">{item.summary}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-cosmic-dim">暂无推荐内容</div>
            )}

            <Link href="/library" className="mt-3 block">
              <Button variant="ghost" size="xs" className="w-full">
                查看全部推荐 <ArrowRight className="ml-1 size-3" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* Row 4: Care Plan */}
      <section>
        <div className="flex items-center gap-3 mb-5">
          <div className="flex items-center justify-center size-10 rounded-xl bg-green-500/10">
            <Sprout className="size-5 text-green-400" />
          </div>
          <div>
            <h2 className="font-semibold text-white">你的照护计划</h2>
            <p className="text-xs text-cosmic-dim">从一个小行动开始关注自己</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CARE_PLAN.map((item) => (
            <Card key={item.title} className="cosmic-card p-4">
              <div className="flex items-center gap-3">
                <Sparkles className={`size-5 ${
                  item.accent === "green" ? "text-green-400" :
                  item.accent === "purple" ? "text-purple-400" :
                  item.accent === "yellow" ? "text-yellow-400" :
                  "text-rose-400"
                }`} />
                <div>
                  <p className="font-medium text-white text-sm">{item.title}</p>
                  <Badge variant={item.status === "进行中" ? "success" : "secondary"} className="mt-1 text-xs">
                    {item.status}
                  </Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

    </div>
  );
}
