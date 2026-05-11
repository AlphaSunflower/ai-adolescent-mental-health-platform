"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import {
  BookMarked,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  HeartHandshake,
  Loader2,
  MessageCircle,
  Plus,
  RefreshCw,
  Send,
  Sparkles,
  Sprout,
  Star,
} from "lucide-react";
import { toast } from "sonner";
import type {
  AiMessage,
  AiSession,
  Appointment,
  AssessmentQuestion,
  AssessmentRecord,
  AssessmentTemplate,
  LibraryItem,
  PatientContact,
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
  EmptyState,
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
import { clearSession, getStoredUser } from "@/lib/session";

type AsyncState = "idle" | "loading" | "ready" | "error";
type ScheduleSlot = {
  id: number;
  label: string;
  serviceType: string;
};

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

function ErrorState({ title, onRetry }: { title: string; onRetry?: () => void }) {
  return (
    <EmptyState
      title={title}
      action={
        onRetry ? (
          <Button variant="outline" onClick={onRetry}>
            <RefreshCw data-icon="inline-start" />
            重试
          </Button>
        ) : undefined
      }
    />
  );
}

function LoadingCards({ count = 3 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index}>
          <CardContent className="flex flex-col gap-3 pt-5">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-1/2" />
          </CardContent>
        </Card>
      ))}
    </>
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

function formatToday() {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(new Date());
}

function parseScheduleSlot(value: Record<string, unknown>): ScheduleSlot {
  const appointmentTime = String(value.appointmentTime ?? value.startTime ?? value.time ?? "");
  const date = appointmentTime.replace("T", " ").slice(0, 16);
  const serviceType = String(value.serviceType ?? value.type ?? "online").toLowerCase();
  return {
    id: Number(value.id ?? value.scheduleId ?? 0),
    label: date || "可预约时段",
    serviceType: serviceType === "offline" ? "到院咨询" : "视频咨询",
  };
}

function defaultQuestions(template: AssessmentTemplate | null): AssessmentQuestion[] {
  return template?.questions?.length
    ? template.questions
    : [
        { id: "0", title: "最近一周我容易感到紧张或坐立不安" },
        { id: "1", title: "我能清楚说出自己压力最大的来源" },
        { id: "2", title: "当情绪上来时，我知道可以找谁帮忙" },
      ];
}

export function HomePage() {
  const [user, setUser] = useState<UserProfile | null>(() => getStoredUser());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [records, setRecords] = useState<Awaited<ReturnType<typeof api.getAssessmentRecords>>["records"]>([]);
  const [sessions, setSessions] = useState<AiSession[]>([]);
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [recommendations, setRecommendations] = useState<LibraryItem[]>([]);
  const [status, setStatus] = useState<AsyncState>("loading");

  const quickActions = [
    { href: "/ai", label: "AI 咨询室", desc: "24 小时陪伴对话", icon: MessageCircle, tone: "xyl-tone-green" },
    { href: "/consultation", label: "心理咨询预约", desc: "与专业咨询师对话", icon: CalendarDays, tone: "xyl-tone-yellow" },
    { href: "/assessment", label: "心理评估", desc: "了解你的心理状态", icon: ClipboardIcon, tone: "xyl-tone-green" },
    { href: "/library", label: "内容馆", desc: "文章 · 课程 · 练习", icon: BookMarked, tone: "xyl-tone-purple" },
    { href: "/me", label: "我的照护计划", desc: "定制成长方案", icon: HeartPlanIcon, tone: "xyl-tone-coral" },
  ];

  function loadHome() {
    setStatus("loading");
    Promise.allSettled([
      api.getUserInfo(),
      api.getMyPsychologistAppointments(),
      api.getAssessmentRecords(),
      api.getAiSessions(),
      Promise.allSettled([api.getArticles(), api.getCourses(), api.getBooks(), api.getCommunityArticles()]),
    ]).then(async ([profileResult, appointmentResult, recordResult, sessionResult, contentResult]) => {
      if (profileResult.status === "fulfilled") setUser(profileResult.value);
      if (appointmentResult.status === "fulfilled") setAppointments(appointmentResult.value.records);
      if (recordResult.status === "fulfilled") setRecords(recordResult.value.records);
      if (sessionResult.status === "fulfilled") {
        setSessions(sessionResult.value);
        const firstSession = sessionResult.value[0];
        if (firstSession) {
          try {
            setMessages(await api.getAiMessages(firstSession.id));
          } catch {
            setMessages([]);
          }
        }
      }
      if (contentResult.status === "fulfilled") {
        setRecommendations(
          contentResult.value.flatMap((result) => (result.status === "fulfilled" ? result.value.records : [])).slice(0, 3),
        );
      }
      setStatus(
        [profileResult, appointmentResult, recordResult, sessionResult, contentResult].some((result) => result.status === "fulfilled")
          ? "ready"
          : "error",
      );
    });
  }

  useEffect(() => {
    void Promise.resolve().then(loadHome);
  }, []);

  const latestMessage = [...messages].reverse().find((message) => message.role === "assistant");
  const latestRecord = records[0];

  return (
    <PageShell>
      <section className="flex flex-col gap-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_560px] lg:items-center">
          <div>
            <h1 className="text-4xl font-semibold leading-tight text-foreground">
              你好，{user?.nickname ?? "欢迎回来"} <Sprout className="inline size-8 text-primary" />
            </h1>
            <div className="mt-5 flex flex-wrap items-center gap-3 text-base text-muted-foreground">
              <span>今天是 {formatToday()}</span>
              <span className="h-5 w-px bg-border" />
              <span>关注自己，从一个小行动开始</span>
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

        {status === "error" && <ErrorState title="暂时无法连接后端，请检查服务状态。" onRetry={loadHome} />}

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
              {status === "loading" ? (
                <Skeleton className="h-28 w-full" />
              ) : latestMessage ? (
                <div className="flex flex-col gap-4">
                  <ChatBubble>
                    <p className="text-muted-foreground">{latestMessage.content}</p>
                  </ChatBubble>
                  <Button variant="ghost" className="w-fit pl-12">
                    查看完整对话记录 <ChevronRight data-icon="inline-end" />
                  </Button>
                </div>
              ) : (
                <EmptyState title={sessions.length ? "当前会话还没有 AI 回复。" : "还没有 AI 会话记录。"} />
              )}
              <AiChatInput onSend={() => toast.message("请进入 AI 咨询室继续对话。")} />
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
              {status === "loading" ? (
                <Skeleton className="h-16 w-full" />
              ) : appointments[0] ? (
                <AppointmentCard appointment={appointments[0]} />
              ) : (
                <EmptyState title="暂无近期预约。" />
              )}
            </ContentCard>

            <ContentCard title="心理评估记录">
              {status === "loading" ? (
                <Skeleton className="h-24 w-full" />
              ) : latestRecord ? (
                <>
                  <p className="font-medium">{latestRecord.title}</p>
                  <div className="mt-4 flex items-center gap-4">
                    <Progress value={latestRecord.score} className="h-2 flex-1" />
                    <span className="text-sm font-semibold text-primary">{latestRecord.score} 分</span>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-muted-foreground">{latestRecord.result}</p>
                </>
              ) : (
                <EmptyState title="暂无测评记录。" />
              )}
            </ContentCard>
          </div>

          <ContentCard className="min-h-[390px] min-w-0 xl:col-span-2 2xl:col-span-1" title="为你推荐">
            {status === "loading" ? (
              <div className="flex flex-col gap-4">
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
              </div>
            ) : recommendations.length ? (
              <div className="flex flex-col gap-4">
                {recommendations.map((item, index) => (
                  <RecommendationItem
                    key={`${item.type}-${item.id}`}
                    item={item}
                    colorClassName={["xyl-thumb-coral", "xyl-thumb-green", "xyl-thumb-yellow"][index]}
                  />
                ))}
                <Button variant="ghost" className="mt-2">
                  查看全部推荐内容 <ChevronRight data-icon="inline-end" />
                </Button>
              </div>
            ) : (
              <EmptyState title="暂无推荐内容。" />
            )}
          </ContentCard>
        </div>

        <Card className="bg-card/70">
          <CardHeader className="flex flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <PlantPot />
              <div>
                <CardTitle className="text-2xl">你的照护计划</CardTitle>
                <CardDescription className="mt-2">后端暂未提供专属照护计划接口，当前展示可用行动入口。</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { title: "继续 AI 对话", status: "进行中" as const, tone: "green" as const },
              { title: "预约专业咨询", status: "待开始" as const, tone: "purple" as const },
              { title: "完成一次测评", status: "待开始" as const, tone: "yellow" as const },
              { title: "阅读支持内容", status: "进行中" as const, tone: "coral" as const },
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
  const [psychologists, setPsychologists] = useState<Psychologist[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<PatientContact[]>([]);
  const [selected, setSelected] = useState<Psychologist | null>(null);
  const [scheduleSlots, setScheduleSlots] = useState<ScheduleSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<ScheduleSlot | null>(null);
  const [status, setStatus] = useState<AsyncState>("loading");
  const [isPending, startTransition] = useTransition();

  function loadConsultation() {
    setStatus("loading");
    Promise.all([api.getPsychologists({ page: 1, size: 12 }), api.getPatients(), api.getMyPsychologistAppointments()])
      .then(([psychologistPage, patientList, appointmentPage]) => {
        setPsychologists(psychologistPage.records);
        setPatients(patientList);
        setAppointments(appointmentPage.records);
        setSelected(psychologistPage.records[0] ?? null);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }

  useEffect(() => {
    void Promise.resolve().then(loadConsultation);
  }, []);

  useEffect(() => {
    if (!selected) {
      void Promise.resolve().then(() => {
        setScheduleSlots([]);
        setSelectedSlot(null);
      });
      return;
    }
    const start = new Date();
    const end = new Date();
    end.setDate(start.getDate() + 7);
    api
      .getPsychologistSchedule(selected.id, start.toISOString().slice(0, 10), end.toISOString().slice(0, 10))
      .then((items) => {
        const slots = items.map(parseScheduleSlot).filter((slot) => slot.id > 0);
        setScheduleSlots(slots);
        setSelectedSlot(slots[0] ?? null);
      })
      .catch(() => {
        setScheduleSlots([]);
        setSelectedSlot(null);
      });
  }, [selected]);

  function createAppointment() {
    if (!selected || !patients[0] || !selectedSlot) {
      toast.error("请先确认咨询师、就诊人和可预约时段");
      return;
    }
    startTransition(async () => {
      try {
        const result = await api.createPsychologistAppointment({
          psychologistId: selected.id,
          patientContactId: patients[0].id,
          serviceType: selectedSlot.serviceType === "到院咨询" ? "offline" : "online",
          scheduleId: selectedSlot.id,
        });
        const id = Number(result.appointmentId);
        if (id) await api.payPsychologistAppointment(id);
        const appointmentPage = await api.getMyPsychologistAppointments();
        setAppointments(appointmentPage.records);
        toast.success("预约已创建并完成虚拟支付");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "预约创建失败");
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
            description="筛选咨询方向、查看排班、选择就诊人并完成虚拟支付。"
          />
        </div>

        {status === "error" ? (
          <ErrorState title="心理咨询数据加载失败，请确认后端服务可用。" onRetry={loadConsultation} />
        ) : (
          <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="flex flex-col gap-3">
              <div className="grid gap-3 sm:grid-cols-3">
                {["青少年情绪", "学业压力", "亲子沟通"].map((tag) => (
                  <Button key={tag} variant="outline">
                    {tag}
                  </Button>
                ))}
              </div>
              {status === "loading" ? (
                <LoadingCards count={3} />
              ) : psychologists.length ? (
                psychologists.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelected(item)}
                    className={`rounded-lg border bg-card p-4 text-left transition-colors hover:border-primary/40 ${
                      selected?.id === item.id ? "border-primary" : ""
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
                          {item.availableToday && <Badge>在线</Badge>}
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{item.title}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {item.fields.length ? (
                            item.fields.map((field) => (
                              <Badge key={field} variant="outline">
                                {field}
                              </Badge>
                            ))
                          ) : (
                            <Badge variant="outline">暂未配置领域</Badge>
                          )}
                        </div>
                      </div>
                      <p className="font-semibold">¥{item.price}</p>
                    </div>
                  </button>
                ))
              ) : (
                <EmptyState title="暂无可预约咨询师。" />
              )}
            </div>

            <Card>
              {selected ? (
                <>
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
                      {scheduleSlots.length ? (
                        scheduleSlots.slice(0, 6).map((slot) => (
                          <button
                            key={slot.id}
                            onClick={() => setSelectedSlot(slot)}
                            className={`rounded-lg border bg-background p-3 text-left ${
                              selectedSlot?.id === slot.id ? "border-primary" : ""
                            }`}
                          >
                            <p className="text-sm font-medium">{slot.label}</p>
                            <p className="mt-1 text-xs text-muted-foreground">{slot.serviceType}</p>
                          </button>
                        ))
                      ) : (
                        <div className="col-span-full">
                          <EmptyState title="暂无可预约排班。" />
                        </div>
                      )}
                    </div>
                    <Separator />
                    <div className="grid gap-4 lg:grid-cols-2">
                      <div className="rounded-lg bg-secondary p-4">
                        <p className="text-sm font-medium">默认就诊人</p>
                        <p className="mt-2 text-lg font-semibold">{patients[0]?.name ?? "暂无就诊人"}</p>
                        <p className="text-sm text-muted-foreground">
                          {patients[0] ? `${patients[0].relation} · ${patients[0].age} 岁` : "请先在个人中心维护就诊人"}
                        </p>
                      </div>
                      <div className="rounded-lg bg-secondary p-4">
                        <p className="text-sm font-medium">订单预估</p>
                        <p className="mt-2 text-lg font-semibold">¥{selected.price}</p>
                        <p className="text-sm text-muted-foreground">提交后调用虚拟支付接口</p>
                      </div>
                    </div>
                    <Button size="lg" onClick={createAppointment} disabled={isPending || !patients[0] || !selectedSlot}>
                      {isPending ? <Loader2 data-icon="inline-start" className="animate-spin" /> : <CalendarClock data-icon="inline-start" />}
                      创建预约并支付
                    </Button>
                  </CardContent>
                </>
              ) : (
                <CardContent>
                  <EmptyState title="请选择咨询师。" />
                </CardContent>
              )}
            </Card>
          </div>
        )}

        <Card className="self-start">
          <CardHeader>
            <CardTitle>我的咨询</CardTitle>
            <CardDescription>预约、取消、评价状态集中管理</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 lg:grid-cols-2">
            {status === "loading" ? (
              <LoadingCards count={2} />
            ) : appointments.length ? (
              appointments.map((item) => (
                <div key={item.id} className="rounded-lg border p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{item.psychologistName}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{item.patientName} · {item.type}</p>
                    </div>
                    <Badge variant="secondary">{item.status}</Badge>
                  </div>
                  <p className="mt-4 text-sm">
                    {item.date} {item.time}
                  </p>
                </div>
              ))
            ) : (
              <div className="lg:col-span-2">
                <EmptyState title="暂无咨询预约。" />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}

export function AiPage() {
  const [sessions, setSessions] = useState<AiSession[]>([]);
  const [activeSession, setActiveSession] = useState<AiSession | null>(null);
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<AsyncState>("loading");
  const [isSending, setIsSending] = useState(false);

  function loadSessions() {
    setStatus("loading");
    api
      .getAiSessions()
      .then((items) => {
        setSessions(items);
        setActiveSession(items[0] ?? null);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }

  useEffect(() => {
    void Promise.resolve().then(loadSessions);
  }, []);

  useEffect(() => {
    if (!activeSession) {
      void Promise.resolve().then(() => setMessages([]));
      return;
    }
    api
      .getAiMessages(activeSession.id)
      .then(setMessages)
      .catch(() => {
        setMessages([]);
        toast.error("AI 消息加载失败");
      });
  }, [activeSession]);

  async function newSession() {
    try {
      const session = await api.createAiSession();
      setSessions((items) => [session, ...items]);
      setActiveSession(session);
      setMessages([]);
      toast.success("已新建会话");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "新建会话失败");
    }
  }

  async function sendMessage() {
    const content = input.trim();
    if (!content || !activeSession || isSending) return;
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
    } catch (error) {
      setMessages((items) => items.filter((item) => item.id !== userMessage.id && item.id !== assistantMessage.id));
      toast.error(error instanceof Error ? error.message : "消息发送失败");
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
            </div>
          </CardHeader>
          <CardContent className="min-h-0 flex-1 overflow-y-auto flex flex-col gap-3">
            <Button onClick={newSession}>
              <Plus data-icon="inline-start" />
              新建会话
            </Button>
            {status === "loading" ? (
              <LoadingCards count={3} />
            ) : status === "error" ? (
              <ErrorState title="AI 会话加载失败。" onRetry={loadSessions} />
            ) : sessions.length ? (
              sessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => setActiveSession(session)}
                  className={`rounded-lg border p-3 text-left transition-colors hover:bg-accent/40 ${
                    session.id === activeSession?.id ? "border-primary bg-accent/40" : "bg-background"
                  }`}
                >
                  <p className="font-medium">{session.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{session.createTime}</p>
                </button>
              ))
            ) : (
              <EmptyState title="还没有 AI 会话。" />
            )}
          </CardContent>
        </Card>

        <Card className="flex min-h-0 flex-col overflow-hidden">
          <CardHeader className="border-b">
            <CardTitle>{activeSession?.title ?? "请选择或新建会话"}</CardTitle>
            <CardDescription>建议把 AI 回答作为支持信息，不能替代专业诊疗或紧急救助。</CardDescription>
          </CardHeader>
          <CardContent className="flex min-h-0 flex-1 flex-col p-0">
            <div className="min-h-0 flex-1 overflow-y-auto p-5">
              {messages.length ? (
                <div className="flex flex-col gap-4">
                  {messages.map((message) => (
                    <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
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
              ) : (
                <EmptyState title={activeSession ? "当前会话还没有消息。" : "请先新建一个 AI 会话。"} />
              )}
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
                  disabled={!activeSession}
                />
                <Button size="icon-lg" onClick={sendMessage} disabled={isSending || !activeSession}>
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
  const [templates, setTemplates] = useState<AssessmentTemplate[]>([]);
  const [records, setRecords] = useState<AssessmentRecord[]>([]);
  const [active, setActive] = useState<AssessmentTemplate | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [status, setStatus] = useState<AsyncState>("loading");
  const [isPending, startTransition] = useTransition();

  function loadAssessments() {
    setStatus("loading");
    Promise.all([api.getAssessmentTemplates(), api.getAssessmentRecords()])
      .then(([templateList, recordPage]) => {
        setTemplates(templateList);
        setActive(templateList[0] ?? null);
        setRecords(recordPage.records);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }

  useEffect(() => {
    void Promise.resolve().then(loadAssessments);
  }, []);

  const questions = defaultQuestions(active);

  function submit() {
    if (!active) return;
    startTransition(async () => {
      try {
        const record = await api.submitAssessment(active.id, answers);
        setRecords((items) => [record, ...items]);
        setAnswers({});
        toast.success("测评已提交");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "测评提交失败");
      }
    });
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
        </div>

        {status === "error" ? (
          <ErrorState title="测评数据加载失败，请确认后端服务可用。" onRetry={loadAssessments} />
        ) : (
          <div className="grid gap-5 lg:grid-cols-[340px_1fr]">
            <div className="flex flex-col gap-3">
              {status === "loading" ? (
                <LoadingCards count={3} />
              ) : templates.length ? (
                templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => {
                      setActive(template);
                      setAnswers({});
                    }}
                    className={`rounded-lg border bg-card p-4 text-left transition-colors hover:border-primary/40 ${
                      active?.id === template.id ? "border-primary" : ""
                    }`}
                  >
                    <Badge variant="secondary">{template.riskLevel}</Badge>
                    <h3 className="mt-3 font-semibold">{template.title}</h3>
                    <p className="mt-1 text-sm leading-5 text-muted-foreground">{template.description}</p>
                    <p className="mt-3 text-xs text-muted-foreground">
                      {template.questionCount || questions.length} 题 · {template.duration}
                    </p>
                  </button>
                ))
              ) : (
                <EmptyState title="暂无公开测评量表。" />
              )}
            </div>

            <Card>
              {active ? (
                <>
                  <CardHeader>
                    <CardTitle>{active.title}</CardTitle>
                    <CardDescription>{active.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-5">
                    {questions.map((question, index) => {
                      const options = question.options?.length
                        ? question.options
                        : [1, 2, 3, 4, 5].map((value) => ({ label: String(value), value }));
                      return (
                        <div key={question.id} className="rounded-lg border p-4">
                          <p className="font-medium">
                            {index + 1}. {question.title}
                          </p>
                          <div className="mt-3 grid grid-cols-5 gap-2">
                            {options.map((option) => (
                              <Button
                                key={`${question.id}-${option.value}`}
                                variant={answers[question.id] === option.value ? "default" : "outline"}
                                onClick={() => setAnswers((item) => ({ ...item, [question.id]: option.value }))}
                              >
                                {option.label}
                              </Button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                    <Button size="lg" onClick={submit} disabled={isPending}>
                      {isPending && <Loader2 data-icon="inline-start" className="animate-spin" />}
                      提交测评
                    </Button>
                  </CardContent>
                </>
              ) : (
                <CardContent>
                  <EmptyState title="请选择测评量表。" />
                </CardContent>
              )}
            </Card>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>历史记录</CardTitle>
            <CardDescription>用于观察变化趋势和咨询前准备</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 lg:grid-cols-2">
            {status === "loading" ? (
              <LoadingCards count={2} />
            ) : records.length ? (
              records.map((record) => (
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
              ))
            ) : (
              <div className="lg:col-span-2">
                <EmptyState title="暂无测评记录。" />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}

export function LibraryPage() {
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [status, setStatus] = useState<AsyncState>("loading");

  function loadLibrary() {
    setStatus("loading");
    Promise.allSettled([api.getArticles(), api.getCourses(), api.getBooks(), api.getCommunityArticles()]).then((results) => {
      const merged = results.flatMap((result) => (result.status === "fulfilled" ? result.value.records : []));
      setItems(merged);
      setStatus(results.some((result) => result.status === "fulfilled") ? "ready" : "error");
    });
  }

  useEffect(() => {
    void Promise.resolve().then(loadLibrary);
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
            description="聚合官方文章、课程、书籍与社区文章。"
          />
        </div>

        {status === "error" ? (
          <ErrorState title="内容库加载失败，请确认后端服务可用。" onRetry={loadLibrary} />
        ) : (
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
                  {status === "loading" ? (
                    <LoadingCards count={4} />
                  ) : list.length ? (
                    list.map((item) => (
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
                          <span>
                            {item.author} · {item.readTime}
                          </span>
                          <span>{item.views} 次浏览</span>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="lg:col-span-2">
                      <EmptyState title="暂无内容。" />
                    </div>
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        )}

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
  const [patients, setPatients] = useState<PatientContact[]>([]);
  const [status, setStatus] = useState<AsyncState>("idle");

  function loadProfile() {
    setStatus("loading");
    Promise.all([api.getUserInfo(), api.getPatients()])
      .then(([profile, patientList]) => {
        setUser(profile);
        setPatients(patientList);
        setStatus("ready");
      })
      .catch(() => {
        if (!getStoredUser()) setUser(null);
        setPatients([]);
        setStatus("error");
      });
  }

  useEffect(() => {
    if (getStoredUser()) void Promise.resolve().then(loadProfile);
  }, []);

  function logout() {
    clearSession();
    setUser(null);
    setPatients([]);
    setStatus("idle");
  }

  return (
    <PageShell>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <SectionIntro
            eyebrow="个人中心"
            title="管理账号、就诊人、收藏、预约与反馈。"
            description="支持账号和邮箱登录。登录后可同步个人信息、就诊人和预约记录。"
          />
        </div>

        {!user ? (
          <EmptyState
            title="登录后可查看个人信息、就诊人和账号服务。"
            action={
              <a href="/login?next=/me">
                <Button>去登录</Button>
              </a>
            }
          />
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
                    <CardDescription>{user.signature ?? "暂无签名"}</CardDescription>
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
                    <Dialog>
                      <DialogTrigger render={<Button variant="outline" />}>
                        <Plus data-icon="inline-start" />
                        添加
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>添加就诊人</DialogTitle>
                          <DialogDescription>添加表单尚未细化，当前不创建本地临时数据。</DialogDescription>
                        </DialogHeader>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-3 sm:grid-cols-2">
                  {status === "loading" ? (
                    <LoadingCards count={2} />
                  ) : patients.length ? (
                    patients.map((patient) => (
                      <div key={patient.id} className="rounded-lg border p-4">
                        <p className="font-semibold">{patient.name}</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {patient.relation} · {patient.age} 岁 · {patient.gender}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="sm:col-span-2">
                      <EmptyState title="暂无就诊人。" />
                    </div>
                  )}
                </CardContent>
              </Card>

              {status === "error" && <ErrorState title="个人数据加载失败。" onRetry={loadProfile} />}

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
