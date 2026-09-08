"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Calendar, Clock, Video, MessageCircle, Star, Heart, MapPin } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/pouf/Tabs";
import { Button } from "@/components/pouf/Button";
import { Badge } from "@/components/pouf/Badge";
import { Skeleton } from "@/components/pouf/Skeleton";
import { Card } from "@/components/pouf/Card";
import { Textarea } from "@/components/pouf/Textarea";
import { Dialog, DialogContent, DialogTitle } from "@/components/pouf/Dialog";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { Appointment, AppointmentStatus, Psychologist } from "@/lib/types";

const STATUS_VARIANTS: Record<string, "secondary" | "gold" | "success" | "destructive"> = {
  "待支付": "gold",
  "待确认": "secondary",
  "已预约": "success",
  "进行中": "success",
  "已完成": "secondary",
  "已取消": "destructive",
};

const STATUS_TABS = [
  { value: "all", label: "全部预约" },
  { value: "active", label: "当前预约" },
  { value: "history", label: "咨询历史" },
  { value: "favorite", label: "收藏咨询师" },
  { value: "chat", label: "图文咨询" },
];

export function PsychologyPage() {
  const router = useRouter();
  const [tab, setTab] = useState("all");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  // Rating dialog
  const [ratingOpen, setRatingOpen] = useState(false);
  const [ratingId, setRatingId] = useState<number | null>(null);
  const [ratingScore, setRatingScore] = useState(5);
  const [ratingContent, setRatingContent] = useState("");
  const [ratingSaving, setRatingSaving] = useState(false);

  // Cancel dialog
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelId, setCancelId] = useState<number | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelSaving, setCancelSaving] = useState(false);

  const [favorites, setFavorites] = useState<Psychologist[]>([]);
  const [favoritesLoading, setFavoritesLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.appointment.my()
      .then((r) => setAppointments(r.records))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (tab === "favorite" && favorites.length === 0) {
      setFavoritesLoading(true);
      api.psychologist.myFavorites()
        .then((data) => setFavorites(data))
        .catch(() => {})
        .finally(() => setFavoritesLoading(false));
    }
  }, [tab, favorites.length]);

  const filtered = (() => {
    if (tab === "active") return appointments.filter((a) => a.status === "待确认" || a.status === "已预约" || a.status === "进行中");
    if (tab === "history") return appointments.filter((a) => a.status === "已完成" || a.status === "已取消");
    if (tab === "chat") return appointments.filter((a) => a.type === "线上咨询");
    return appointments;
  })();

  const openRating = (id: number) => {
    setRatingId(id);
    setRatingScore(5);
    setRatingContent("");
    setRatingOpen(true);
  };

  const submitRating = async () => {
    if (!ratingId) return;
    setRatingSaving(true);
    try {
      await api.appointment.rate(ratingId, ratingScore, ratingContent);
      toast.success("评价成功");
      setRatingOpen(false);
    } catch {
      toast.error("评价失败");
    } finally {
      setRatingSaving(false);
    }
  };

  const openCancel = (id: number) => {
    setCancelId(id);
    setCancelReason("");
    setCancelOpen(true);
  };

  const submitCancel = async () => {
    if (!cancelId || !cancelReason.trim()) {
      toast.error("请填写取消原因");
      return;
    }
    setCancelSaving(true);
    try {
      await api.appointment.cancel(cancelId, cancelReason.trim());
      toast.success("已取消预约");
      setCancelOpen(false);
      setAppointments((prev) => prev.map((a) => a.id === cancelId ? { ...a, status: "已取消" as AppointmentStatus } : a));
    } catch {
      toast.error("取消失败");
    } finally {
      setCancelSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40 w-full rounded-xl" />)}
      </div>
    );
  }

  const showRating = (tab === "history");

  return (
    <div>
      <h1 className="mb-6 text-xl font-black text-ink">我的心理咨询</h1>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-6 flex-wrap">
          {STATUS_TABS.map((t) => <TabsTrigger key={t.value} value={t.value}>{t.label}</TabsTrigger>)}
        </TabsList>
        <TabsContent value={tab}>
          {tab === "favorite" ? (
            favoritesLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
              </div>
            ) : favorites.length === 0 ? (
              <div className="py-20 text-center text-muted">
                还没有收藏的咨询师
                <div className="mt-4">
                  <Link href="/consultation/psychologist"><Button tone="purple" variant="solid" size="sm">去发现咨询师</Button></Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {favorites.map((fav) => (
                  <Link key={fav.id} href={`/consultation/psychologist/${fav.id}`} className="block transition-all">
                    <Card className="flex items-center gap-4 p-4 transition-all hover:-translate-y-0.5">
                      <div className="size-14 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(201, 168, 255, 0.25)", boxShadow: "0 0 0 4px rgba(201, 168, 255, 0.4), 0 0 20px rgba(201, 168, 255, 0.15)" }}>
                        {fav.avatar ? (
                          <img src={fav.avatar} alt={fav.name} className="size-14 rounded-full object-cover" />
                        ) : (
                          <span className="text-xl font-bold text-purple">{fav.name[0]}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-black text-ink">{fav.name}</h3>
                        <p className="text-xs text-muted">{fav.title}</p>
                        <div className="mt-1 flex items-center gap-3 text-xs text-muted/70">
                          {fav.city && <span className="inline-flex items-center gap-0.5"><MapPin className="size-3" />{fav.city}</span>}
                          <span className="text-yellow font-bold">¥{fav.price}/次</span>
                        </div>
                      </div>
                      <Heart className="size-5 text-yellow fill-yellow shrink-0" />
                    </Card>
                  </Link>
                ))}
              </div>
            )
          ) : tab === "chat" ? (
            <div className="py-20 text-center text-muted">暂无图文咨询记录</div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center text-muted">
              暂无预约记录
              <div className="mt-4">
                <Link href="/consultation/psychologist"><Button tone="purple" variant="solid" size="sm">去预约咨询师</Button></Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((item) => (
                <Card key={item.id} className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-black text-ink">{item.psychologistName}</h3>
                        <Badge variant={STATUS_VARIANTS[item.status] ?? "secondary"}>{item.status}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted/70 mb-3">
                        <span className="inline-flex items-center gap-1"><Calendar className="size-3" />{item.date}</span>
                        <span className="inline-flex items-center gap-1"><Clock className="size-3" />{item.time}</span>
                        <span>{item.type}</span>
                        <span className="text-yellow font-semibold">¥{item.fee}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-purple/10">
                    {(item.status === "待确认" || item.status === "已预约" || item.status === "进行中") && (
                      <>
                        <Button tone="purple" variant="solid" size="sm" onClick={() => router.push(`/consultation/chat/${item.id}`)}>
                          <Video className="size-3.5 mr-1" />进入咨询
                        </Button>
                        <Button variant="quiet" size="sm" onClick={() => router.push(`/consultation/chat/${item.id}`)}>
                          <MessageCircle className="size-3.5 mr-1" />图文咨询
                        </Button>
                        <Button variant="quiet" size="sm" onClick={() => openCancel(item.id)}>取消预约</Button>
                      </>
                    )}
                    {item.status === "待支付" && (
                      <>
                        <Button tone="purple" variant="solid" size="sm" onClick={async () => {
                          try {
                            await api.appointment.pay(item.id);
                            toast.success("支付成功");
                            setAppointments((prev) => prev.map((a) => a.id === item.id ? { ...a, status: "待确认" as AppointmentStatus } : a));
                          } catch {
                            toast.error("支付失败，请重试");
                          }
                        }}>去支付</Button>
                        <Button variant="quiet" size="sm" onClick={() => openCancel(item.id)}>取消预约</Button>
                      </>
                    )}
                    {item.status === "已完成" && (
                      <Button tone="yellow" variant="solid" size="sm" onClick={() => openRating(item.id)}>
                        <Star className="size-3.5 mr-1" />评价
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Rating Dialog */}
      <Dialog open={ratingOpen} onOpenChange={setRatingOpen}>
        <DialogContent className="!max-w-sm">
          <DialogTitle>评价咨询师</DialogTitle>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm text-muted/70">评分</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    onClick={() => setRatingScore(s)}
                    className={`text-2xl transition-colors ${s <= ratingScore ? "text-yellow" : "text-muted/30"}`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm text-muted/70">评价内容</label>
              <Textarea
                value={ratingContent}
                onChange={(e) => setRatingContent(e.target.value)}
                rows={3}
                placeholder="分享您的咨询体验..."
              />
            </div>
            <div className="flex gap-2">
              <Button variant="quiet" size="sm" onClick={() => setRatingOpen(false)}>取消</Button>
              <Button variant="solid" size="sm" onClick={submitRating} disabled={ratingSaving}>
                {ratingSaving ? "提交中..." : "提交评价"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent className="!max-w-sm">
          <DialogTitle>取消预约</DialogTitle>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm text-muted/70">取消原因</label>
              <Textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={3}
                placeholder="请填写取消原因..."
              />
            </div>
            <div className="flex gap-2">
              <Button variant="quiet" size="sm" onClick={() => setCancelOpen(false)}>返回</Button>
              <Button variant="solid" size="sm" onClick={submitCancel} disabled={cancelSaving}>
                {cancelSaving ? "提交中..." : "确认取消"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
