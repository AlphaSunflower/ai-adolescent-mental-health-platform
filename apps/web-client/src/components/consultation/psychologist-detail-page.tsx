"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Star, MapPin, Clock, Heart, Calendar, Medal,
  Users, MessageCircle, Video, Phone, CheckCircle2, Sparkles,
  BookOpen, GraduationCap, Award, ChevronDown, X, Building2
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { api } from "@/lib/api";
import type { Psychologist } from "@/lib/types";

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
  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<string | null>(null);

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

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8 md:py-12">
        <Skeleton className="mb-4 h-5 w-24" />
        <div className="cosmic-card mb-8 p-6 md:p-8">
          <div className="flex flex-col gap-6 md:flex-row">
            <Skeleton className="size-[130px] rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-10 w-48" />
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-64" />
              <Skeleton className="h-5 w-full" />
            </div>
          </div>
        </div>
        <div className="cosmic-card p-8">
          <Skeleton className="mb-4 h-6 w-32" />
          <Skeleton className="mb-2 h-4 w-full" />
          <Skeleton className="mb-2 h-4 w-5/6" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    );
  }

  if (!p) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center">
        <p className="text-lg text-cosmic-muted">咨询师不存在</p>
        <Link href="/consultation/psychologist" className="mt-4 inline-block text-cosmic-sky hover:underline">
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
        className="mb-6 inline-flex items-center gap-1 text-sm text-cosmic-muted hover:text-cosmic-sky transition-colors"
      >
        <ArrowLeft className="size-4" />
        返回列表
      </Link>

      {/* Info Card */}
      <div className="cosmic-card mb-8 overflow-hidden">
        <div className="flex flex-col gap-6 p-6 md:flex-row md:p-8">
          {/* Left: Avatar */}
          <div className="flex flex-col items-center gap-2">
            <div
              className="size-[130px] rounded-full flex items-center justify-center shrink-0"
              style={{
                background: "rgba(100, 149, 237, 0.2)",
                boxShadow: "0 0 0 4px rgba(255, 215, 0, 0.5), 0 0 30px rgba(255, 215, 0, 0.15)",
              }}
            >
              {p.avatar ? (
                <img src={p.avatar} alt={p.name} className="size-[130px] rounded-full object-cover" />
              ) : (
                <span className="text-5xl font-bold text-cosmic-sky">{p.name[0]}</span>
              )}
            </div>
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              p.availableToday ? "bg-green-500/80 text-white" : "bg-gray-500/60 text-gray-300"
            }`}>
              {p.availableToday ? "在线" : "离线"}
            </span>
          </div>

          {/* Middle: Info */}
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold text-white">{p.name}</h1>
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
                  <div className="text-lg font-bold text-cosmic-gold">{p.title}</div>
                  <div className="text-xs text-cosmic-muted">职称</div>
                </div>
              )}
              <div className="text-center">
                <div className="text-lg font-bold text-cosmic-gold">{p.rating}</div>
                <div className="text-xs text-cosmic-muted">评分</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-cosmic-gold">{p.city}</div>
                <div className="text-xs text-cosmic-muted">
                  <MapPin className="inline size-3" /> 所在城市
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="mt-4 flex flex-wrap gap-2">
              {p.fields.map((f) => (
                <span key={f} className="cosmic-tag">{f}</span>
              ))}
              {p.serviceTypes.map((s) => (
                <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
              ))}
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex flex-col items-center gap-3 md:items-end">
            <Button
              variant={isFavorite ? "gold" : "outline"}
              size="sm"
              onClick={() => { setIsFavorite(!isFavorite); toast.success(isFavorite ? "已取消收藏" : "已收藏"); }}
            >
              <Heart className={`mr-1 size-4 ${isFavorite ? "fill-current" : ""}`} />
              {isFavorite ? "已收藏" : "收藏"}
            </Button>
            <Button
              variant="primary"
              size="default"
              onClick={() => { setTab("services"); setBookingOpen(true); }}
            >
              <Calendar className="mr-1 size-4" />
              立即预约
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-6 grid w-full grid-cols-5">
          <TabsTrigger value="intro">个人简介</TabsTrigger>
          <TabsTrigger value="fields">擅长领域</TabsTrigger>
          <TabsTrigger value="services">服务与价格</TabsTrigger>
          <TabsTrigger value="schedule">预约咨询</TabsTrigger>
          <TabsTrigger value="reviews">用户评价</TabsTrigger>
        </TabsList>

        {/* Tab 1: 个人简介 */}
        <TabsContent value="intro" className="space-y-6">
          <div className="cosmic-card p-6">
            <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-white">
              <BookOpen className="size-5 text-cosmic-sky" />个人介绍
            </h3>
            <p className="leading-relaxed text-cosmic-muted whitespace-pre-wrap">{p.intro}</p>
          </div>

          <div className="cosmic-card p-6">
            <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-white">
              <GraduationCap className="size-5 text-cosmic-sky" />教育背景
            </h3>
            <p className="leading-relaxed text-cosmic-muted whitespace-pre-wrap">
              {p.educationBackground || "暂无教育背景信息"}
            </p>
          </div>

          <div className="cosmic-card p-6">
            <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-white">
              <Medal className="size-5 text-cosmic-gold" />受训经历
            </h3>
            <p className="leading-relaxed text-cosmic-muted whitespace-pre-wrap">
              {p.trainingExperience || "暂无受训经历信息"}
            </p>
          </div>

          <div className="cosmic-card p-6">
            <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-white">
              <Award className="size-5 text-cosmic-gold" />资质认证
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {p.fields.map((f) => (
                <div key={f} className="flex items-center gap-2 rounded-lg bg-white/5 px-4 py-3">
                  <CheckCircle2 className="size-4 text-green-400 shrink-0" />
                  <span className="text-sm text-cosmic-muted">{f}</span>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Tab 2: 擅长领域 */}
        <TabsContent value="fields">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {p.fields.map((f) => (
              <div key={f} className="cosmic-card p-5 text-center hover:-translate-y-1 transition-all">
                <div className="mx-auto mb-3 size-12 rounded-xl bg-cosmic-blue/20 flex items-center justify-center">
                  <Sparkles className="size-6 text-cosmic-sky" />
                </div>
                <h3 className="font-semibold text-white">{f}</h3>
              </div>
            ))}
          </div>
          {p.fields.length === 0 && (
            <div className="cosmic-card p-12 text-center text-cosmic-muted">暂无擅长领域信息</div>
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
                  className={`cosmic-card relative p-5 text-left transition-all hover:-translate-y-1 ${
                    isSelected ? "!border-cosmic-gold/60 bg-cosmic-gold/10" : ""
                  }`}
                >
                  {isSelected && (
                    <div className="absolute right-3 top-3 size-6 rounded-full bg-cosmic-gold flex items-center justify-center">
                      <CheckCircle2 className="size-4 text-cosmic-navy-start" />
                    </div>
                  )}
                  <div className="mb-3 inline-flex rounded-lg bg-cosmic-blue/20 p-2.5">
                    <Icon className="size-5 text-cosmic-sky" />
                  </div>
                  <h3 className="mb-1 font-semibold text-white">{s.label}</h3>
                  <p className="mb-3 text-sm text-cosmic-muted">专业一对一{s.label}服务</p>
                  <div className="text-xl font-bold text-cosmic-gold">
                    ¥{s.price?.toFixed(0) ?? "0"}
                    <span className="text-sm font-normal text-cosmic-dim">/次</span>
                  </div>
                </button>
              );
            })}
          </div>
          {services.length === 0 && (
            <div className="cosmic-card p-12 text-center text-cosmic-muted">暂无可预约服务</div>
          )}
        </TabsContent>

        {/* Tab 4: 预约咨询 */}
        <TabsContent value="schedule">
          <div className="cosmic-card p-6">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
              <Calendar className="size-5 text-cosmic-sky" />选择预约时间
            </h3>

            {/* 7-day view placeholder */}
            <div className="mb-6 grid grid-cols-7 gap-2">
              {Array.from({ length: 7 }).map((_, i) => {
                const date = new Date();
                date.setDate(date.getDate() + i);
                const isToday = i === 0;
                const dayNames = ["日", "一", "二", "三", "四", "五", "六"];
                return (
                  <button
                    key={i}
                    type="button"
                    disabled={i < 0}
                    className={`rounded-xl border p-3 text-center transition-all hover:-translate-y-0.5 ${
                      isToday ? "border-cosmic-gold/60 bg-cosmic-gold/10" : "border-white/10 bg-white/5"
                    }`}
                  >
                    <div className="text-xs text-cosmic-dim">
                      周{dayNames[date.getDay()]}
                    </div>
                    <div className={`text-lg font-bold ${isToday ? "text-cosmic-gold" : "text-white"}`}>
                      {date.getDate()}
                    </div>
                    <div className="mt-1 flex justify-center gap-0.5">
                      <span className="size-1.5 rounded-full bg-green-400" />
                      <span className="size-1.5 rounded-full bg-green-400" />
                      <span className="size-1.5 rounded-full bg-yellow-400" />
                    </div>
                  </button>
                );
              })}
            </div>

            <p className="mb-4 text-sm text-cosmic-dim">点击日期选择可预约时段</p>

            {/* Selected service summary */}
            {selectedService && (
              <div className="rounded-xl bg-cosmic-gold/10 border border-cosmic-gold/20 p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-cosmic-muted">已选服务：</span>
                    <span className="text-sm font-semibold text-white ml-1">
                      {services.find((s) => s.type === selectedService)?.label}
                    </span>
                  </div>
                  <Button variant="primary" size="xs" onClick={() => setBookingOpen(true)}>
                    立即预约
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Booking Dialog */}
          <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
            <DialogContent className="!max-w-lg">
              <DialogTitle>填写预约信息</DialogTitle>
              <div className="space-y-4">
                <div className="rounded-lg bg-white/5 p-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="size-4 text-cosmic-sky" />
                    <span className="text-cosmic-muted">咨询师：</span>
                    <span className="text-white">{p.name}</span>
                  </div>
                  {selectedService && (
                    <div className="mt-2 flex items-center gap-2 text-sm">
                      <span className="text-cosmic-muted">服务：</span>
                      <span className="text-white">
                        {services.find((s) => s.type === selectedService)?.label}
                      </span>
                      <span className="ml-auto font-semibold text-cosmic-gold">
                        ¥{services.find((s) => s.type === selectedService)?.price?.toFixed(0) ?? "0"}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-sm text-cosmic-muted">主要问题（必填）</label>
                  <textarea
                    rows={4}
                    className="cosmic-input w-full rounded-xl px-4 py-3 text-sm resize-none"
                    placeholder="请描述您希望咨询的主要问题..."
                  />
                </div>

                <p className="text-xs text-cosmic-dim">
                  预约成功后，费用将从您的虚拟账户扣除。心理师接受预约后，会收到通知。
                </p>

                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline" size="sm">取消</Button>
                  </DialogClose>
                  <Button variant="primary" size="sm">
                    确认预约
                  </Button>
                </DialogFooter>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* Tab 5: 用户评价 */}
        <TabsContent value="reviews">
          <div className="mb-6 flex items-center gap-6">
            <div className="text-center">
              <div className="text-5xl font-bold text-cosmic-gold">{p.rating}</div>
              <div className="mt-1 flex justify-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={i < Math.round(p.rating) ? "text-cosmic-gold fill-current" : "text-cosmic-dim"}
                    style={{ width: 16, height: 16 }}
                  />
                ))}
              </div>
            </div>
            <div className="text-sm text-cosmic-muted">
              基于用户真实评价
            </div>
          </div>

          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="cosmic-card p-4">
                <div className="mb-2 flex items-center gap-2">
                  <div className="size-8 rounded-full bg-cosmic-blue/20 flex items-center justify-center">
                    <span className="text-sm font-bold text-cosmic-sky">U</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">用户{i + 1}</p>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Star
                          key={j}
                          className={j < 4 ? "text-cosmic-gold fill-current" : "text-cosmic-dim"}
                          style={{ width: 12, height: 12 }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-cosmic-muted">
                  咨询师很有耐心，给了我很多实用的建议。
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4 py-8 text-center text-cosmic-dim text-sm">
            更多评价功能开发中
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
