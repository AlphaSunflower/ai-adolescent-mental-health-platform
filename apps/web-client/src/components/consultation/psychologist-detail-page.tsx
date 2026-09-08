"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Star, MapPin, Clock, Heart, Calendar, Medal,
  Users, MessageCircle, Video, Phone, CheckCircle2, Sparkles,
  BookOpen, GraduationCap, Award, ChevronDown, Building2, Loader2
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/pouf/Button";
import { Badge } from "@/components/pouf/Badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/pouf/Tabs";
import { Skeleton } from "@/components/pouf/Skeleton";
import { Card } from "@/components/pouf/Card";
import { api } from "@/lib/api";
import type { Psychologist } from "@/lib/types";

type ScheduleSlot = {
  id: number;
  date: string;
  timeSlot: string;
  startTime: string;
  endTime: string;
  bookedCount: number;
  maxAppointments: number;
  status: number;
};

function formatDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function timeSlotLabel(timeSlot: string): string {
  if (timeSlot === "MORNING") return "上午";
  if (timeSlot === "AFTERNOON") return "下午";
  if (timeSlot === "EVENING") return "晚上";
  return timeSlot;
}

function getDisplayServices(p: Psychologist) {
  const services: { type: string; label: string; price?: number; icon: typeof MessageCircle }[] = [];
  const hasOnline = p.serviceTypes.some((s) =>
    s.includes("视频") || s.includes("语音") || s.includes("图文"),
  );
  if (hasOnline) {
    services.push({ type: "online", label: "线上咨询", price: p.onlinePrice ?? p.price, icon: Video });
  }
  if (p.serviceTypes.some((s) => s.includes("线下")) || p.offlinePrice) {
    services.push({ type: "offline", label: "线下面询", price: p.offlinePrice, icon: Building2 });
  }
  if (services.length === 0) {
    services.push({ type: "default", label: "咨询", price: p.price, icon: MessageCircle });
  }
  return services;
}

export function PsychologistDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [p, setP] = useState<Psychologist | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("intro");
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [schedules, setSchedules] = useState<ScheduleSlot[]>([]);
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const [selectedScheduleId, setSelectedScheduleId] = useState<number | null>(null);

  const fetchSchedules = async (date: Date) => {
    setLoadingSchedules(true);
    setSelectedScheduleId(null);
    try {
      const dayStart = formatDateStr(date);
      const dayEnd = formatDateStr(date);
      const raw = await api.psychologist.schedule(Number(id), dayStart, dayEnd);
      const mapped: ScheduleSlot[] = [];
      for (const day of (raw as Record<string, unknown>[])) {
        const dayDate = String(day.date ?? "");
        const slots = day.slots as Record<string, unknown>[] | undefined;
        if (slots && Array.isArray(slots)) {
          for (const s of slots) {
            mapped.push({
              id: Number(s.id),
              date: String(s.scheduleDate ?? dayDate),
              timeSlot: String(s.timeSlot ?? ""),
              startTime: String(s.startTime ?? ""),
              endTime: String(s.endTime ?? ""),
              bookedCount: Number(s.bookedCount ?? 0),
              maxAppointments: Number(s.maxAppointments ?? 0),
              status: Number(s.status ?? 0),
            });
          }
        }
      }
      setSchedules(mapped);
    } catch {
      setSchedules([]);
    } finally {
      setLoadingSchedules(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const detail = await api.psychologist.detail(Number(id));
        setP(detail);
        setIsFavorite(detail.isFavorite ?? false);
      } catch {
        toast.error("加载咨询师信息失败");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    if (id) fetchSchedules(new Date());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleBook = async () => {
    if (!selectedScheduleId) {
      toast.error("请先选择预约时段");
      return;
    }
    if (!p) return;
    setSubmitting(true);
    try {
      const svc = selectedService
        ? services.find((s) => s.type === selectedService)
        : services[0];
      const isOffline = svc?.type === "offline";
      await api.appointment.create({
        psychologistId: p.id,
        scheduleId: selectedScheduleId,
        serviceType: isOffline ? "OFFLINE" : "video",
        description: "",
      });
      toast.success("预约成功");
      setSelectedService(null);
      setSelectedScheduleId(null);
      setSchedules([]);
    } catch {
      toast.error("预约失败，请重试");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8 md:py-12">
        <Skeleton className="mb-4 h-5 w-24" />
        <Card className="mb-8 p-6 md:p-8">
          <div className="flex flex-col gap-6 md:flex-row">
            <Skeleton className="size-[130px] rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-10 w-48" />
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-64" />
              <Skeleton className="h-5 w-full" />
            </div>
          </div>
        </Card>
        <Card className="p-8">
          <Skeleton className="mb-4 h-6 w-32" />
          <Skeleton className="mb-2 h-4 w-full" />
          <Skeleton className="mb-2 h-4 w-5/6" />
          <Skeleton className="h-4 w-3/4" />
        </Card>
      </div>
    );
  }

  if (!p) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center">
        <p className="text-lg text-muted">咨询师不存在</p>
        <Link href="/consultation/psychologist" className="mt-4 inline-block text-purple hover:underline">
          返回列表
        </Link>
      </div>
    );
  }

  const services = getDisplayServices(p);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:py-12">
      {/* Back nav */}
      <Link
        href="/consultation/psychologist"
        className="mb-6 inline-flex items-center gap-1 text-sm font-bold text-muted transition-colors hover:text-purple"
      >
        <ArrowLeft className="size-4" />
        返回列表
      </Link>

      {/* Info Card */}
      <Card className="mb-8 overflow-hidden">
        <div className="flex flex-col gap-6 p-6 md:flex-row md:p-8">
          {/* Left: Avatar */}
          <div className="flex flex-col items-center gap-2">
            <div
              className="flex size-[130px] shrink-0 items-center justify-center rounded-full"
              style={{
                background: "rgba(201, 168, 255, 0.25)",
                boxShadow: "0 0 0 4px rgba(201, 168, 255, 0.4), 0 0 30px rgba(201, 168, 255, 0.25)",
              }}
            >
              {p.avatar ? (
                <img src={p.avatar} alt={p.name} className="size-[130px] rounded-full object-cover" />
              ) : (
                <span className="text-5xl font-black text-purple">{p.name[0]}</span>
              )}
            </div>
            <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${
              p.availableToday ? "bg-mint text-[var(--on-accent)]" : "bg-purple/15 text-muted"
            }`}>
              {p.availableToday ? "在线" : "离线"}
            </span>
          </div>

          {/* Middle: Info */}
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-black text-ink">{p.name}</h1>
              <Badge variant="gold">
                <CheckCircle2 className="mr-1 size-3" />已认证
              </Badge>
              {p.availableToday && (
                <Badge variant="success">正常接单</Badge>
              )}
            </div>

            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
              {p.title && (
                <div className="text-center">
                  <div className="text-lg font-black text-purple">{p.title}</div>
                  <div className="text-xs font-bold text-muted">职称</div>
                </div>
              )}
              <div className="text-center">
                <div className="text-lg font-black text-purple">{p.rating}</div>
                <div className="text-xs font-bold text-muted">评分</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-black text-purple">{p.city}</div>
                <div className="text-xs font-bold text-muted">
                  <MapPin className="inline size-3" /> 所在城市
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="mt-4 flex flex-wrap gap-2">
              {p.fields.map((f) => (
                <span key={f} className="rounded-control bg-purple/10 px-2 py-0.5 text-xs font-bold text-ink">{f}</span>
              ))}
              {p.serviceTypes.map((s) => (
                <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
              ))}
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex flex-col items-center gap-3 md:items-end">
            <Button
              tone={isFavorite ? "yellow" : "purple"}
              variant={isFavorite ? "solid" : "quiet"}
              size="sm"
              onClick={async () => {
                const wasFavorite = isFavorite;
                setIsFavorite(!isFavorite);
                try {
                  await api.psychologist.favorite(p.id);
                  toast.success(wasFavorite ? "已取消收藏" : "已收藏");
                } catch {
                  setIsFavorite(wasFavorite);
                  toast.error("操作失败，请重试");
                }
              }}
            >
              <Heart className={`mr-1 size-4 ${isFavorite ? "fill-current" : ""}`} />
              {isFavorite ? "已收藏" : "收藏"}
            </Button>
            <Button
              tone="purple"
              size="md"
              onClick={() => setTab("services")}
            >
              <Calendar className="mr-1 size-4" />
              立即预约
            </Button>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="intro">个人简介</TabsTrigger>
          <TabsTrigger value="fields">擅长领域</TabsTrigger>
          <TabsTrigger value="services">服务与价格</TabsTrigger>
          <TabsTrigger value="schedule">预约咨询</TabsTrigger>
          <TabsTrigger value="reviews">用户评价</TabsTrigger>
        </TabsList>

        {/* Tab 1: 个人简介 */}
        <TabsContent value="intro" className="space-y-6">
          <Card className="p-6">
            <h3 className="mb-3 flex items-center gap-2 text-lg font-black text-ink">
              <BookOpen className="size-5 text-blue" />个人介绍
            </h3>
            <p className="whitespace-pre-wrap leading-relaxed text-muted">{p.intro}</p>
          </Card>

          <Card className="p-6">
            <h3 className="mb-3 flex items-center gap-2 text-lg font-black text-ink">
              <GraduationCap className="size-5 text-blue" />教育背景
            </h3>
            <p className="whitespace-pre-wrap leading-relaxed text-muted">
              {p.educationBackground || "暂无教育背景信息"}
            </p>
          </Card>

          <Card className="p-6">
            <h3 className="mb-3 flex items-center gap-2 text-lg font-black text-ink">
              <Medal className="size-5 text-yellow" />受训经历
            </h3>
            <p className="whitespace-pre-wrap leading-relaxed text-muted">
              {p.trainingExperience || "暂无受训经历信息"}
            </p>
          </Card>

          <Card className="p-6">
            <h3 className="mb-3 flex items-center gap-2 text-lg font-black text-ink">
              <Award className="size-5 text-yellow" />资质认证
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {p.fields.map((f) => (
                <div key={f} className="flex items-center gap-2 rounded-control bg-purple/10 px-4 py-3">
                  <CheckCircle2 className="size-4 shrink-0 text-mint" />
                  <span className="text-sm font-bold text-muted">{f}</span>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Tab 2: 擅长领域 */}
        <TabsContent value="fields">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {p.fields.map((f) => (
              <Card key={f} className="p-5 text-center transition-all hover:-translate-y-1">
                <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-control bg-purple/20">
                  <Sparkles className="size-6 text-purple" />
                </div>
                <h3 className="font-black text-ink">{f}</h3>
              </Card>
            ))}
          </div>
          {p.fields.length === 0 && (
            <Card className="p-12 text-center text-muted">暂无擅长领域信息</Card>
          )}
        </TabsContent>

        {/* Tab 3: 服务与价格 */}
        <TabsContent value="services">
          <div className="grid gap-4 sm:grid-cols-2">
            {services.map((s) => {
              const isSelected = selectedService === s.type;
              const Icon = s.icon;
              return (
                <button
                  key={s.type}
                  type="button"
                  onClick={() => { setSelectedService(s.type); setTab("schedule"); }}
                  className={`cushion-card relative rounded-card bg-surface p-5 text-left transition-all hover:-translate-y-1 ${
                    isSelected ? "border-2 border-purple/50" : "border-2 border-transparent"
                  }`}
                >
                  {isSelected && (
                    <div className="absolute right-3 top-3 flex size-6 items-center justify-center rounded-full bg-yellow">
                      <CheckCircle2 className="size-4 text-[var(--on-accent)]" />
                    </div>
                  )}
                  <div className="mb-3 inline-flex rounded-control bg-purple/20 p-2.5">
                    <Icon className="size-5 text-purple" />
                  </div>
                  <h3 className="mb-1 font-black text-ink">{s.label}</h3>
                  <p className="mb-3 text-sm font-bold text-muted">专业一对一{s.label}服务</p>
                  <div className="text-xl font-black text-purple">
                    ¥{s.price?.toFixed(0) ?? "0"}
                    <span className="text-sm font-bold text-muted">/次</span>
                  </div>
                </button>
              );
            })}
          </div>
          {services.length === 0 && (
            <Card className="p-12 text-center text-muted">暂无可预约服务</Card>
          )}
        </TabsContent>

        {/* Tab 4: 预约咨询 */}
        <TabsContent value="schedule">
          <Card className="p-4 sm:p-6">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-black text-ink">
              <Calendar className="size-5 text-blue" />选择预约时间
            </h3>

            {/* 7-day view */}
            <div className="mb-6 flex gap-1.5 overflow-x-auto sm:grid sm:grid-cols-7 sm:gap-2 sm:overflow-visible">
              {Array.from({ length: 7 }).map((_, i) => {
                const date = new Date();
                date.setDate(date.getDate() + i);
                const isSelected = i === selectedDayIndex;
                const dayNames = ["日", "一", "二", "三", "四", "五", "六"];
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setSelectedDayIndex(i);
                      const d = new Date();
                      d.setDate(d.getDate() + i);
                      fetchSchedules(d);
                    }}
                    className={`shrink-0 w-[52px] rounded-control border px-3 py-2.5 text-center transition-all hover:-translate-y-0.5 sm:w-auto sm:p-3 ${
                      isSelected ? "border-purple/50 bg-purple/10" : "border-[rgba(201,168,255,0.3)] bg-surface"
                    }`}
                  >
                    <div className="text-[11px] font-bold text-muted sm:text-xs">
                      周{dayNames[date.getDay()]}
                    </div>
                    <div className={`text-base font-black sm:text-lg ${isSelected ? "text-purple" : "text-ink"}`}>
                      {date.getDate()}
                    </div>
                    <div className="mt-1 flex justify-center gap-0.5">
                      <span className="size-1 rounded-full bg-mint sm:size-1.5" />
                      <span className="size-1 rounded-full bg-mint sm:size-1.5" />
                      <span className="size-1 rounded-full bg-yellow sm:size-1.5" />
                    </div>
                  </button>
                );
              })}
            </div>

            {loadingSchedules ? (
              <div className="mb-4 flex items-center gap-2 text-sm font-bold text-muted">
                <Loader2 className="size-4 animate-spin" /> 加载排班中...
              </div>
            ) : schedules.length > 0 ? (
              <div className="mb-4">
                <p className="mb-2 text-sm font-bold text-muted">选择时段：</p>
                <div className="flex flex-wrap gap-2">
                  {schedules.map((s) => {
                    const isFull = s.bookedCount >= s.maxAppointments;
                    const isPicked = selectedScheduleId === s.id;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        disabled={isFull || s.status === 0}
                        onClick={() => setSelectedScheduleId(s.id)}
                        className={`rounded-control border px-4 py-2 text-sm font-bold transition-all ${
                          isPicked
                            ? "border-purple bg-purple/20 text-purple"
                            : isFull || s.status === 0
                              ? "cursor-not-allowed border-[rgba(201,168,255,0.2)] bg-purple/5 text-muted/60"
                              : "border-[rgba(201,168,255,0.3)] bg-surface text-muted hover:border-purple/40 hover:text-ink"
                        }`}
                      >
                        <div>{timeSlotLabel(s.timeSlot)} {s.startTime?.slice(0, 5)}-{s.endTime?.slice(0, 5)}</div>
                        <div className="mt-0.5 text-xs opacity-60">
                          {isFull ? "已约满" : s.status === 0 ? "休息" : `余${s.maxAppointments - s.bookedCount}位`}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : selectedDayIndex >= 0 ? (
              <p className="mb-4 text-sm font-bold text-muted">该日期暂无可用排班</p>
            ) : null}

            {/* Selected service summary + direct book */}
            {(selectedService || selectedScheduleId) && (
              <div className="mb-4 rounded-control border border-purple/20 bg-purple/10 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    {selectedService && (
                      <>
                        <span className="text-sm font-bold text-muted">已选服务：</span>
                        <span className="ml-1 text-sm font-black text-ink">
                          {services.find((s) => s.type === selectedService)?.label}
                        </span>
                      </>
                    )}
                    {selectedScheduleId && (
                      <span className="ml-3 text-sm font-bold text-muted">
                        已选时段
                      </span>
                    )}
                  </div>
                  <Button
                    tone="purple"
                    size="sm"
                    disabled={submitting || !selectedScheduleId}
                    onClick={handleBook}
                  >
                    {submitting ? "预约中..." : "立即预约"}
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Tab 5: 用户评价 */}
        <TabsContent value="reviews">
          <div className="mb-6 flex items-center gap-6">
            <div className="text-center">
              <div className="text-5xl font-black text-purple">{p.rating}</div>
              <div className="mt-1 flex justify-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={i < Math.round(p.rating) ? "text-yellow fill-current" : "text-muted/40"}
                    style={{ width: 16, height: 16 }}
                  />
                ))}
              </div>
            </div>
            <div className="text-sm font-bold text-muted">
              基于用户真实评价
            </div>
          </div>

          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="p-4">
                <div className="mb-2 flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-full bg-purple/20">
                    <span className="text-sm font-black text-purple">U</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-ink">用户{i + 1}</p>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Star
                          key={j}
                          className={j < 4 ? "text-yellow fill-current" : "text-muted/40"}
                          style={{ width: 12, height: 12 }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-sm font-bold text-muted">
                  咨询师很有耐心，给了我很多实用的建议。
                </p>
              </Card>
            ))}
          </div>

          <div className="mt-4 py-8 text-center text-sm font-bold text-muted">
            更多评价功能开发中
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
