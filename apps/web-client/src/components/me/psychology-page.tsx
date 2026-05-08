"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Calendar, Clock, Video, MessageCircle, Star } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { Appointment, AppointmentStatus } from "@/lib/types";

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

  useEffect(() => {
    setLoading(true);
    api.appointment.my()
      .then((r) => setAppointments(r.records))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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
      <h1 className="mb-6 text-xl font-bold text-white">我的心理咨询</h1>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-6 flex-wrap">
          {STATUS_TABS.map((t) => <TabsTrigger key={t.value} value={t.value}>{t.label}</TabsTrigger>)}
        </TabsList>
        <TabsContent value={tab}>
          {tab === "favorite" ? (
            <div className="py-20 text-center text-cosmic-muted">
              还没有收藏的咨询师
              <div className="mt-4">
                <Link href="/consultation/psychologist"><Button variant="primary" size="sm">去发现咨询师</Button></Link>
              </div>
            </div>
          ) : tab === "chat" ? (
            <div className="py-20 text-center text-cosmic-muted">暂无图文咨询记录</div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center text-cosmic-muted">
              暂无预约记录
              <div className="mt-4">
                <Link href="/consultation/psychologist"><Button variant="primary" size="sm">去预约咨询师</Button></Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((item) => (
                <div key={item.id} className="cosmic-card p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-white">{item.psychologistName}</h3>
                        <Badge variant={STATUS_VARIANTS[item.status] ?? "secondary"}>{item.status}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-cosmic-dim mb-3">
                        <span className="inline-flex items-center gap-1"><Calendar className="size-3" />{item.date}</span>
                        <span className="inline-flex items-center gap-1"><Clock className="size-3" />{item.time}</span>
                        <span>{item.type}</span>
                        <span className="text-cosmic-gold font-semibold">¥{item.fee}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                    {(item.status === "待确认" || item.status === "已预约" || item.status === "进行中") && (
                      <>
                        <Button variant="primary" size="xs" onClick={() => router.push(`/consultation/chat/${item.id}`)}>
                          <Video className="size-3.5 mr-1" />进入咨询
                        </Button>
                        <Button variant="ghost" size="xs" onClick={() => router.push(`/consultation/chat/${item.id}`)}>
                          <MessageCircle className="size-3.5 mr-1" />图文咨询
                        </Button>
                        <Button variant="ghost" size="xs" className="text-red-400" onClick={() => openCancel(item.id)}>取消预约</Button>
                      </>
                    )}
                    {item.status === "待支付" && (
                      <>
                        <Button variant="primary" size="xs">去支付</Button>
                        <Button variant="ghost" size="xs" className="text-red-400" onClick={() => openCancel(item.id)}>取消预约</Button>
                      </>
                    )}
                    {item.status === "已完成" && (
                      <Button variant="gold" size="xs" onClick={() => openRating(item.id)}>
                        <Star className="size-3.5 mr-1" />评价
                      </Button>
                    )}
                  </div>
                </div>
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
              <label className="mb-2 block text-sm text-cosmic-dim">评分</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    onClick={() => setRatingScore(s)}
                    className={`text-2xl transition-colors ${s <= ratingScore ? "text-yellow-400" : "text-white/20"}`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm text-cosmic-dim">评价内容</label>
              <textarea
                value={ratingContent}
                onChange={(e) => setRatingContent(e.target.value)}
                rows={3}
                className="cosmic-input w-full rounded-lg px-3 py-2 text-sm resize-none"
                placeholder="分享您的咨询体验..."
              />
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setRatingOpen(false)}>取消</Button>
              <Button variant="primary" size="sm" onClick={submitRating} disabled={ratingSaving}>
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
              <label className="mb-1 block text-sm text-cosmic-dim">取消原因</label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={3}
                className="cosmic-input w-full rounded-lg px-3 py-2 text-sm resize-none"
                placeholder="请填写取消原因..."
              />
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setCancelOpen(false)}>返回</Button>
              <Button variant="primary" size="sm" onClick={submitCancel} disabled={cancelSaving}>
                {cancelSaving ? "提交中..." : "确认取消"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
