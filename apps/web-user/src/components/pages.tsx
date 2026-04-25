"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import {
  BookMarked,
  CalendarDays,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  CloudSun,
  HeartHandshake,
  Loader2,
  MessageCircle,
  Plus,
  Send,
  Sparkles,
  Sprout,
  Star,
} from "lucide-react";
import { toast } from "sonner";
import type {
  AiMessage,
  AiSession,
  AssessmentTemplate,
  Psychologist,
  UserProfile,
} from "@ai-adolescent-mental-health/domain";
import {
  AiChatInput,
  AppointmentCard,
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CarePlanItem,
  ChatBubble,
  ContentCard,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Progress,
  RecommendationItem,
  Separator,
  ShortcutCard,
  Skeleton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
} from "@ai-adolescent-mental-health/ui";

import { AppShell } from "@/components/app-shell";
import { api, streamAiChat } from "@/lib/api";
import {
  mockAiMessages,
  mockAiSessions,
  mockAppointments,
  mockAssessmentRecords,
  mockAssessments,
  mockLibrary,
  mockPatients,
  mockPsychologists,
  mockUser,
} from "@/lib/mock-data";
import { clearSession, getStoredUser, saveSession } from "@/lib/session";

function PageShell({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}

function SectionIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Badge variant="secondary" className="w-fit">
        {eyebrow}
      </Badge>
      <h2 className="max-w-3xl text-3xl font-semibold leading-tight lg:text-4xl">{title}</h2>
      <p className="max-w-2xl text-sm leading-6 text-muted-foreground lg:text-base">{description}</p>
    </div>
  );
}

function DataState({ isFallback }: { isFallback: boolean }) {
  return (
    <Badge variant={isFallback ? "outline" : "secondary"} className="w-fit">
      {isFallback ? "演示数据" : "真实 API"}
    </Badge>
  );
}

function ClipboardIcon() {
  return <CheckCircle2 />;
}

function HeartPlanIcon() {
  return <HeartHandshake />;
}

function PlantPot({ tall = false }: { tall?: boolean }) {
  return (
    <span className="relative block h-16 w-12">
      <span className="absolute bottom-0 left-2 h-5 w-8 rounded-b-lg rounded-t-sm bg-primary/30" />
      <span className="absolute bottom-5 left-1/2 h-8 w-px -translate-x-1/2 bg-primary/60" />
      <span className="absolute bottom-9 left-2 size-4 rounded-full bg-primary/35" />
      <span className="absolute bottom-10 right-2 size-5 rounded-full bg-primary/45" />
      {tall && <span className="absolute bottom-12 left-5 size-5 rounded-full bg-primary/40" />}
    </span>
  );
}

export function HomePage() {
  const quickActions = [
    { href: "/ai", label: "AI 咨询室", desc: "24 小时陪伴对话", icon: MessageCircle, tone: "xyl-tone-green" },
    { href: "/consultation", label: "心理咨询预约", desc: "与专业咨询师对话", icon: CalendarDays, tone: "xyl-tone-yellow" },
    { href: "/assessment", label: "心理评估", desc: "了解你的心理状态", icon: ClipboardIcon, tone: "xyl-tone-green" },
    { href: "/library", label: "内容馆", desc: "文章 · 课程 · 练习", icon: BookMarked, tone: "xyl-tone-purple" },
    { href: "/me", label: "我的照护计划", desc: "定制成长方案", icon: HeartPlanIcon, tone: "xyl-tone-coral" },
  ];

  return (
    <PageShell>
      <section className="flex flex-col gap-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_560px] lg:items-center">
          <div>
            <h1 className="text-4xl font-semibold leading-tight text-foreground">
              你好，林小雨 <Sprout className="inline size-8 text-primary" />
            </h1>
            <div className="mt-5 flex flex-wrap items-center gap-3 text-base text-muted-foreground">
              <span>今天是 5 月 18 日，星期六</span>
              <span className="h-5 w-px bg-border" />
              <CloudSun className="size-4" />
              <span>多云 24°C</span>
            </div>
          </div>
          <div className="xyl-banner relative hidden h-28 overflow-hidden rounded-lg lg:block">
            <div className="absolute left-8 top-5 text-xl font-medium leading-8 text-primary">
              <p>每一次关注自己，</p>
              <p>都是成长的开始。</p>
              <span className="mt-3 block h-1 w-8 rounded-full bg-primary" />
            </div>
            <div className="xyl-hero-scene absolute bottom-0 right-0 h-full w-72 rounded-l-lg" />
            <span className="xyl-hero-plant-left" />
            <span className="xyl-hero-plant-right" />
          </div>
        </div>

        <div className="grid min-w-0 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
          {quickActions.map((item) => {
            const Icon = item.icon;
            return (
              <ShortcutCard
                key={item.href}
                href={item.href}
                title={item.label}
                description={item.desc}
                icon={<Icon className="size-6" />}
                iconClassName={item.tone}
                className={item.tone}
              />
            );
          })}
        </div>

        <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(300px,0.9fr)] 2xl:grid-cols-[minmax(420px,480px)_minmax(300px,340px)_minmax(0,1fr)]">
          <ContentCard
            className="flex h-full min-h-[390px] flex-col [&>div:last-child]:flex [&>div:last-child]:flex-1 [&>div:last-child]:flex-col [&>div:last-child]:pb-3"
            title={
              <>
                AI 咨询室
                <span className="ml-1 text-sm font-normal text-muted-foreground">· 最新对话</span>
              </>
            }
          >
            <div className="flex flex-1 flex-col justify-between gap-4">
              <div className="flex flex-col gap-4">
                <ChatBubble>
                  <div>
                    <p className="font-medium">嗨，林小雨 你好</p>
                    <p className="mt-2 text-muted-foreground">
                      你昨天提到的“考试压力大、睡得不好”，听起来真的很辛苦呢。
                      你愿意和我多聊聊最近让你有压力的事情吗？
                    </p>
                  </div>
                </ChatBubble>
                <Button variant="ghost" className="w-fit pl-12">
                  查看完整对话记录 <ChevronRight data-icon="inline-end" />
                </Button>
              </div>
              <AiChatInput onSend={() => toast.message("已记录你的想法，小艾会继续陪你梳理。")} />
            </div>
          </ContentCard>

          <div className="grid min-w-0 gap-5">
            <ContentCard
              title="近期预约"
              action={
                <Button variant="ghost" size="sm">
                  查看全部 <ChevronRight data-icon="inline-end" />
                </Button>
              }
            >
              <AppointmentCard appointment={{ ...mockAppointments[0], psychologistName: "王舒然", date: "5 月 21 日（周二）", time: "15:00", status: "待确认" }} />
            </ContentCard>

            <ContentCard
              title="心理评估进度"
              action={
                <Button variant="ghost" size="sm">
                  查看全部 <ChevronRight data-icon="inline-end" />
                </Button>
              }
            >
              <p className="font-medium">青少年心理健康量表（SCL-90）</p>
              <div className="mt-4 flex items-center gap-4">
                <Progress value={60} className="h-2 flex-1" />
                <span className="text-sm font-semibold text-primary">60%</span>
              </div>
              <div className="mt-4 flex items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">已完成 54/90 题</p>
                <Button size="sm" variant="secondary">继续作答</Button>
              </div>
            </ContentCard>
          </div>

          <ContentCard
            className="min-h-[390px] min-w-0 xl:col-span-2 2xl:col-span-1"
            title="为你推荐"
            action={
              <Button variant="ghost" size="sm">换一换</Button>
            }
          >
            <div className="flex flex-col gap-4">
              {mockLibrary.slice(0, 3).map((item, index) => (
                <RecommendationItem
                  key={`${item.type}-${item.id}`}
                  item={item}
                  saved={index === 0}
                  colorClassName={["xyl-thumb-coral", "xyl-thumb-green", "xyl-thumb-yellow"][index]}
                />
              ))}
              <Button variant="ghost" className="mt-2">
                查看全部推荐内容 <ChevronRight data-icon="inline-end" />
              </Button>
            </div>
          </ContentCard>
        </div>

        <Card className="bg-card/70">
          <CardHeader className="flex flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <PlantPot />
              <div>
                <CardTitle className="text-2xl">你的照护计划</CardTitle>
                <CardDescription className="mt-2">基于你的评估和目标，我们为你定制了专属计划</CardDescription>
              </div>
            </div>
            <div className="hidden min-w-72 items-center gap-4 lg:flex">
              <span className="text-sm font-medium">本周完成度</span>
              <Progress value={57} className="h-2" />
              <span className="font-semibold">4/7</span>
              <Button variant="outline">查看计划详情</Button>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { title: "情绪觉察", status: "进行中" as const, tone: "green" as const },
              { title: "睡眠改善", status: "待开始" as const, tone: "purple" as const },
              { title: "压力管理", status: "已完成" as const, tone: "yellow" as const },
              { title: "自信成长", status: "进行中" as const, tone: "coral" as const },
            ].map((item) => (
              <CarePlanItem key={item.title} title={item.title} status={item.status} tone={item.tone} icon={<Sparkles className="size-5" />} />
            ))}
          </CardContent>
        </Card>
      </section>
    </PageShell>
  );
}

export function ConsultationPage() {
  const [psychologists, setPsychologists] = useState(mockPsychologists);
  const [appointments, setAppointments] = useState(mockAppointments);
  const [patients, setPatients] = useState(mockPatients);
  const [selected, setSelected] = useState<Psychologist>(mockPsychologists[0]);
  const [isFallback, setIsFallback] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    Promise.all([api.getPsychologists({ page: 1, size: 12 }), api.getPatients(), api.getMyPsychologistAppointments()])
      .then(([psychologistPage, patientList, appointmentPage]) => {
        setPsychologists(psychologistPage.records.length ? psychologistPage.records : mockPsychologists);
        setPatients(patientList.length ? patientList : mockPatients);
        setAppointments(appointmentPage.records.length ? appointmentPage.records : mockAppointments);
        setSelected((psychologistPage.records[0] as Psychologist | undefined) ?? mockPsychologists[0]);
        setIsFallback(false);
      })
      .catch(() => setIsFallback(true));
  }, []);

  function createAppointment() {
    startTransition(async () => {
      try {
        const result = await api.createPsychologistAppointment({
          psychologistId: selected.id,
          patientContactId: patients[0]?.id,
          serviceType: "online",
          scheduleId: 1,
        });
        const id = Number(result.appointmentId ?? Date.now());
        await api.payPsychologistAppointment(id).catch(() => undefined);
        setAppointments((items) => [
          {
            id,
            psychologistName: selected.name,
            patientName: patients[0]?.name ?? "本人",
            date: "2026-04-25",
            time: "19:30",
            status: "已预约",
            type: "线上咨询",
            fee: selected.price,
          },
          ...items,
        ]);
        toast.success("预约已创建并完成虚拟支付");
      } catch {
        setAppointments((items) => [
          {
            id: Date.now(),
            psychologistName: selected.name,
            patientName: patients[0]?.name ?? "本人",
            date: "2026-04-25",
            time: "19:30",
            status: "已预约",
            type: "线上咨询",
            fee: selected.price,
          },
          ...items,
        ]);
        toast.message("后端未连接，已用演示数据完成预约流程");
      }
    });
  }

  return (
    <PageShell>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <SectionIntro
            eyebrow="心理咨询"
            title="找到合适的人，再决定预约方式。"
            description="筛选咨询方向、查看排班、选择就诊人并完成虚拟支付。页面优先消费真实后端接口，失败时保持完整演示流程。"
          />
          <DataState isFallback={isFallback} />
        </div>

        <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="flex flex-col gap-3">
            <div className="grid gap-3 sm:grid-cols-3">
              {["青少年情绪", "学业压力", "亲子沟通"].map((tag) => (
                <Button key={tag} variant="outline">
                  {tag}
                </Button>
              ))}
            </div>
            {psychologists.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelected(item)}
                className={`rounded-lg border bg-card p-4 text-left transition-colors hover:border-primary/40 ${
                  selected.id === item.id ? "border-primary" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  <Avatar className="size-12">
                    <AvatarFallback>{item.name.slice(0, 1)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold">{item.name}</h3>
                      <Badge variant="secondary">{item.rating} 分</Badge>
                      {item.availableToday && <Badge>今日可约</Badge>}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{item.title}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {item.fields.map((field) => (
                        <Badge key={field} variant="outline">
                          {field}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <p className="font-semibold">¥{item.price}</p>
                </div>
              </button>
            ))}
          </div>

          <Card>
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardTitle>{selected.name}</CardTitle>
                  <CardDescription>{selected.intro}</CardDescription>
                </div>
                <Button variant="outline">
                  <Star data-icon="inline-start" />
                  {selected.isFavorite ? "已收藏" : "收藏"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <div className="grid gap-3 sm:grid-cols-3">
                {["4/25 周六 19:30", "4/26 周日 10:00", "4/27 周一 20:00"].map((slot, index) => (
                  <div key={slot} className="rounded-lg border bg-background p-3">
                    <p className="text-sm font-medium">{slot}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{index === 1 ? "到院咨询可选" : "视频咨询"}</p>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-lg bg-secondary p-4">
                  <p className="text-sm font-medium">默认就诊人</p>
                  <p className="mt-2 text-lg font-semibold">{patients[0]?.name ?? "本人"}</p>
                  <p className="text-sm text-muted-foreground">{patients[0]?.relation ?? "本人"} · {patients[0]?.age ?? 16} 岁</p>
                </div>
                <div className="rounded-lg bg-secondary p-4">
                  <p className="text-sm font-medium">订单预估</p>
                  <p className="mt-2 text-lg font-semibold">¥{selected.price}</p>
                  <p className="text-sm text-muted-foreground">提交后调用虚拟支付接口</p>
                </div>
              </div>
              <Button size="lg" onClick={createAppointment} disabled={isPending}>
                {isPending ? <Loader2 data-icon="inline-start" className="animate-spin" /> : <CalendarClock data-icon="inline-start" />}
                创建预约并支付
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="self-start">
          <CardHeader>
            <CardTitle>我的咨询</CardTitle>
            <CardDescription>预约、取消、评价状态集中管理</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 lg:grid-cols-2">
            {appointments.map((item) => (
              <div key={item.id} className="rounded-lg border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{item.psychologistName}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{item.patientName} · {item.type}</p>
                  </div>
                  <Badge variant="secondary">{item.status}</Badge>
                </div>
                <p className="mt-4 text-sm">{item.date} {item.time}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}

export function AiPage() {
  const [sessions, setSessions] = useState(mockAiSessions);
  const [activeSession, setActiveSession] = useState<AiSession>(mockAiSessions[0]);
  const [messages, setMessages] = useState(mockAiMessages);
  const [input, setInput] = useState("");
  const [isFallback, setIsFallback] = useState(true);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    api
      .getAiSessions()
      .then((items) => {
        const nextSessions = items.length ? items : mockAiSessions;
        setSessions(nextSessions);
        setActiveSession(nextSessions[0]);
        setIsFallback(false);
        return api.getAiMessages(nextSessions[0].id);
      })
      .then((items) => setMessages(items.length ? items : mockAiMessages))
      .catch(() => setIsFallback(true));
  }, []);

  async function newSession() {
    try {
      const session = await api.createAiSession();
      setSessions((items) => [session, ...items]);
      setActiveSession(session);
      setMessages([]);
      setIsFallback(false);
    } catch {
      const session = { id: Date.now(), title: "新的支持会话", createTime: "刚刚" };
      setSessions((items) => [session, ...items]);
      setActiveSession(session);
      setMessages([]);
      setIsFallback(true);
    }
  }

  async function sendMessage() {
    const content = input.trim();
    if (!content || isSending) return;
    setInput("");
    setIsSending(true);
    const userMessage: AiMessage = { id: Date.now(), role: "user", content, createTime: "现在" };
    const assistantMessage: AiMessage = { id: Date.now() + 1, role: "assistant", content: "", createTime: "现在" };
    setMessages((items) => [...items, userMessage, assistantMessage]);
    try {
      await streamAiChat(activeSession.id, content, (chunk) => {
        setMessages((items) =>
          items.map((item) => (item.id === assistantMessage.id ? { ...item, content: `${item.content}${chunk}` } : item)),
        );
      });
      setIsFallback(false);
    } catch {
      const chunks = ["我先陪你把这件事拆小一点。", "现在可以写下：发生了什么、我感受到什么、我需要谁的帮助。", "如果出现强烈危险念头，请立刻联系家人、老师或当地急救资源。"];
      for (const chunk of chunks) {
        await new Promise((resolve) => setTimeout(resolve, 220));
        setMessages((items) =>
          items.map((item) => (item.id === assistantMessage.id ? { ...item, content: `${item.content}${chunk}` } : item)),
        );
      }
      setIsFallback(true);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <PageShell>
      <div className="grid min-h-[calc(100vh-9rem)] gap-5 lg:h-[calc(100vh-9rem)] lg:grid-cols-[320px_1fr]">
        <Card className="flex min-h-0 flex-col">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle>AI 问诊</CardTitle>
                <CardDescription>小艾支持会话</CardDescription>
              </div>
              <DataState isFallback={isFallback} />
            </div>
          </CardHeader>
          <CardContent className="min-h-0 flex-1 overflow-y-auto flex flex-col gap-3">
            <Button onClick={newSession}>
              <Plus data-icon="inline-start" />
              新建会话
            </Button>
            {sessions.map((session) => (
              <button
                key={session.id}
                onClick={() => setActiveSession(session)}
                className={`rounded-lg border p-3 text-left transition-colors hover:bg-accent/40 ${
                  session.id === activeSession.id ? "border-primary bg-accent/40" : "bg-background"
                }`}
              >
                <p className="font-medium">{session.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{session.createTime}</p>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card className="flex min-h-0 flex-col overflow-hidden">
          <CardHeader className="border-b">
            <CardTitle>{activeSession.title}</CardTitle>
            <CardDescription>建议把 AI 回答作为支持信息，不能替代专业诊疗或紧急救助。</CardDescription>
          </CardHeader>
          <CardContent className="flex min-h-0 flex-1 flex-col p-0">
            <div className="min-h-0 flex-1 overflow-y-auto p-5">
              <div className="flex flex-col gap-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[78%] rounded-lg px-4 py-3 text-sm leading-6 ${
                        message.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                      }`}
                    >
                      {message.content || <Skeleton className="h-5 w-40" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t px-4 py-3">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") sendMessage();
                  }}
                  placeholder="把现在最困扰你的事写下来"
                  className="h-12 rounded-full"
                />
                <Button size="icon-lg" onClick={sendMessage} disabled={isSending}>
                  {isSending ? <Loader2 className="animate-spin" /> : <Send />}
                  <span className="sr-only">发送</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}

export function AssessmentPage() {
  const [templates, setTemplates] = useState(mockAssessments);
  const [records, setRecords] = useState(mockAssessmentRecords);
  const [active, setActive] = useState<AssessmentTemplate>(mockAssessments[0]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isFallback, setIsFallback] = useState(true);

  useEffect(() => {
    Promise.all([api.getAssessmentTemplates(), api.getAssessmentRecords()])
      .then(([templateList, recordPage]) => {
        setTemplates(templateList.length ? templateList : mockAssessments);
        setActive((templateList[0] as AssessmentTemplate | undefined) ?? mockAssessments[0]);
        setRecords(recordPage.records.length ? recordPage.records : mockAssessmentRecords);
        setIsFallback(false);
      })
      .catch(() => setIsFallback(true));
  }, []);

  async function submit() {
    const score = Object.values(answers).reduce((sum, value) => sum + value, 0);
    try {
      const record = await api.submitAssessment(active.id, answers);
      setRecords((items) => [record, ...items]);
      setIsFallback(false);
      toast.success("测评已提交");
    } catch {
      setRecords((items) => [
        {
          id: Date.now(),
          title: active.title,
          score: Math.max(42, score * 8),
          result: score > 10 ? "存在一定压力，建议预约咨询师进一步讨论" : "当前波动较轻，建议保持观察",
          createTime: "刚刚",
        },
        ...items,
      ]);
      setIsFallback(true);
      toast.message("已用演示数据生成测评结果");
    }
  }

  return (
    <PageShell>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <SectionIntro
            eyebrow="心理测评"
            title="先快速筛查，再把结果沉淀为可追踪记录。"
            description="量表用于帮助识别状态变化，不做诊断结论。提交后进入个人测评记录，便于咨询前沟通。"
          />
          <DataState isFallback={isFallback} />
        </div>

        <div className="grid gap-5 lg:grid-cols-[340px_1fr]">
          <div className="flex flex-col gap-3">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => setActive(template)}
                className={`rounded-lg border bg-card p-4 text-left transition-colors hover:border-primary/40 ${
                  active.id === template.id ? "border-primary" : ""
                }`}
              >
                <Badge variant="secondary">{template.riskLevel}</Badge>
                <h3 className="mt-3 font-semibold">{template.title}</h3>
                <p className="mt-1 text-sm leading-5 text-muted-foreground">{template.description}</p>
                <p className="mt-3 text-xs text-muted-foreground">{template.questionCount} 题 · {template.duration}</p>
              </button>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{active.title}</CardTitle>
              <CardDescription>{active.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              {["最近一周我容易感到紧张或坐立不安", "我能清楚说出自己压力最大的来源", "当情绪上来时，我知道可以找谁帮忙"].map((question, index) => (
                <div key={question} className="rounded-lg border p-4">
                  <p className="font-medium">{index + 1}. {question}</p>
                  <div className="mt-3 grid grid-cols-5 gap-2">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <Button
                        key={value}
                        variant={answers[index] === value ? "default" : "outline"}
                        onClick={() => setAnswers((item) => ({ ...item, [index]: value }))}
                      >
                        {value}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
              <Button size="lg" onClick={submit}>
                提交测评
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>历史记录</CardTitle>
            <CardDescription>用于观察变化趋势和咨询前准备</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 lg:grid-cols-2">
            {records.map((record) => (
              <div key={record.id} className="rounded-lg border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{record.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{record.createTime}</p>
                  </div>
                  <Badge>{record.score} 分</Badge>
                </div>
                <p className="mt-3 text-sm leading-6">{record.result}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}

export function LibraryPage() {
  const [items, setItems] = useState(mockLibrary);
  const [isFallback, setIsFallback] = useState(true);

  useEffect(() => {
    Promise.allSettled([api.getArticles(), api.getCourses(), api.getBooks(), api.getCommunityArticles()]).then((results) => {
      const merged = results.flatMap((result) => (result.status === "fulfilled" ? result.value.records : []));
      if (merged.length) {
        setItems(merged);
        setIsFallback(false);
      }
    });
  }, []);

  const grouped = useMemo(
    () => ({
      all: items,
      articles: items.filter((item) => item.type === "文章"),
      courses: items.filter((item) => item.type === "课程"),
      books: items.filter((item) => item.type === "书籍"),
      community: items.filter((item) => item.type === "社区"),
    }),
    [items],
  );

  return (
    <PageShell>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <SectionIntro
            eyebrow="内容库"
            title="把专业内容和同伴经验组织成可继续行动的阅读路径。"
            description="聚合官方文章、课程、书籍与社区文章。后端接口返回为空或不可用时使用精选演示内容。"
          />
          <DataState isFallback={isFallback} />
        </div>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">全部</TabsTrigger>
            <TabsTrigger value="articles">文章</TabsTrigger>
            <TabsTrigger value="courses">课程</TabsTrigger>
            <TabsTrigger value="books">书籍</TabsTrigger>
            <TabsTrigger value="community">社区</TabsTrigger>
          </TabsList>
          {Object.entries(grouped).map(([key, list]) => (
            <TabsContent key={key} value={key}>
              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                {list.map((item) => (
                  <Card key={`${item.type}-${item.id}`}>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{item.type}</Badge>
                        <Badge variant="outline">{item.tag}</Badge>
                      </div>
                      <CardTitle>{item.title}</CardTitle>
                      <CardDescription>{item.summary}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
                      <span>{item.author} · {item.readTime}</span>
                      <span>{item.views} 次浏览</span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <Card>
          <CardHeader>
            <CardTitle>发布社区文章</CardTitle>
            <CardDescription>首版保留发布入口，提交后进入待审核流程。</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Input placeholder="标题" />
            <Textarea placeholder="写下你想分享的经验或困惑" />
            <Button className="w-fit">
              <MessageCircle data-icon="inline-start" />
              提交审核
            </Button>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}

export function MePage() {
  const [user, setUser] = useState<UserProfile | null>(() => getStoredUser());
  const [patients, setPatients] = useState(mockPatients);
  const [isFallback, setIsFallback] = useState(true);
  const [email, setEmail] = useState("demo@example.com");
  const [password, setPassword] = useState("demo123456");

  useEffect(() => {
    const stored = getStoredUser();
    Promise.all([api.getUserInfo(), api.getPatients()])
      .then(([profile, patientList]) => {
        setUser(profile);
        setPatients(patientList.length ? patientList : mockPatients);
        setIsFallback(false);
      })
      .catch(() => {
        if (!stored) setUser(null);
        setIsFallback(true);
      });
  }, []);

  async function login() {
    try {
      const result = await api.loginByEmailPassword(email, password);
      setUser(result.user);
      setIsFallback(false);
      toast.success("登录成功");
    } catch {
      saveSession("demo-token", mockUser);
      setUser(mockUser);
      setIsFallback(true);
      toast.message("后端未连接，已进入演示登录态");
    }
  }

  function logout() {
    clearSession();
    setUser(null);
  }

  function addPatient() {
    setPatients((items) => [
      ...items,
      { id: Date.now(), name: "新的就诊人", relation: "家人", age: 15, gender: "未设置" },
    ]);
  }

  return (
    <PageShell>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <SectionIntro
            eyebrow="个人中心"
            title="管理账号、就诊人、收藏、预约与反馈。"
            description="首版以邮箱登录为主，微信/公众号能力保留接口封装，实际可用性依赖后端配置。"
          />
          <DataState isFallback={isFallback} />
        </div>

        {!user ? (
          <Card className="max-w-xl">
            <CardHeader>
              <CardTitle>邮箱登录</CardTitle>
              <CardDescription>连接后端时调用真实登录接口；本地开发可演示登录。</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="邮箱" />
              <Input value={password} onChange={(event) => setPassword(event.target.value)} type="password" placeholder="密码" />
              <Button onClick={login}>登录 / 演示进入</Button>
              <div className="flex gap-2">
                <Button variant="outline">发送验证码</Button>
                <Button variant="ghost">忘记密码</Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
            <Card>
              <CardHeader>
                <div className="flex items-start gap-4">
                  <Avatar className="size-14">
                    <AvatarFallback>{user.nickname.slice(0, 1)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>{user.nickname}</CardTitle>
                    <CardDescription>{user.signature ?? "愿意被好好支持，也愿意慢慢练习。"}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <InfoRow label="邮箱" value={user.email ?? "未绑定"} />
                <InfoRow label="电话" value={user.phone ?? "未填写"} />
                <InfoRow label="账号" value={user.username ?? String(user.id)} />
                <Button variant="outline" onClick={logout}>
                  退出登录
                </Button>
              </CardContent>
            </Card>

            <div className="grid gap-5">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <CardTitle>就诊人</CardTitle>
                      <CardDescription>预约和测评可选择不同就诊人</CardDescription>
                    </div>
                    <Button variant="outline" onClick={addPatient}>
                      <Plus data-icon="inline-start" />
                      添加
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-3 sm:grid-cols-2">
                  {patients.map((patient) => (
                    <div key={patient.id} className="rounded-lg border p-4">
                      <p className="font-semibold">{patient.name}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{patient.relation} · {patient.age} 岁 · {patient.gender}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>账号服务</CardTitle>
                  <CardDescription>常用设置和支持入口</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3 sm:grid-cols-3">
                  {["我的收藏", "消息中心", "平台反馈"].map((label) => (
                    <Dialog key={label}>
                      <DialogTrigger render={<Button variant="outline" />}>{label}</DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{label}</DialogTitle>
                          <DialogDescription>该入口已保留，后续可继续细化列表和表单。</DialogDescription>
                        </DialogHeader>
                      </DialogContent>
                    </Dialog>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </PageShell>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg bg-secondary px-3 py-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
