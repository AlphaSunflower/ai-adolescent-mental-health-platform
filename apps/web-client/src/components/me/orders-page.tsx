"use client";

import { useEffect, useState } from "react";
import { FileText, Clock, Video, CircleCheck, Eye, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { Appointment, AppointmentStatus } from "@/lib/types";

const STATUS_VARIANTS: Record<AppointmentStatus, "secondary" | "gold" | "success" | "destructive"> = {
  "待支付": "gold",
  "待确认": "secondary",
  "已预约": "success",
  "进行中": "success",
  "已完成": "secondary",
  "已取消": "destructive",
};

export function MeOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");

  // Detail dialog
  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState<Appointment | null>(null);

  useEffect(() => {
    setLoading(true);
    api.appointment.my()
      .then((r) => setOrders(r.records))
      .catch(() => toast.error("加载订单失败"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = tab === "all" ? orders : orders.filter((o) => {
    const t = o.type as string;
    if (tab === "psychologist") return t === "线上咨询" || t === "到院咨询";
    if (tab === "book") return t === "书籍";
    if (tab === "assessment") return t === "测评";
    return true;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "待支付" || o.status === "待确认").length,
    ongoing: orders.filter((o) => o.status === "已预约" || o.status === "进行中").length,
    completed: orders.filter((o) => o.status === "已完成").length,
  };

  const statCards = [
    { label: "全部订单", value: stats.total, icon: FileText, color: "text-blue-400" },
    { label: "待处理", value: stats.pending, icon: Clock, color: "text-yellow-400" },
    { label: "进行中", value: stats.ongoing, icon: Video, color: "text-cyan-400" },
    { label: "已完成", value: stats.completed, icon: CircleCheck, color: "text-green-400" },
  ];

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-32" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold text-white">我的订单</h1>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {statCards.map((card) => (
          <div key={card.label} className="cosmic-card p-4 flex items-center gap-3">
            <div className="rounded-lg bg-white/5 p-2">
              <card.icon className={`size-5 ${card.color}`} />
            </div>
            <div>
              <p className="text-lg font-bold text-white">{card.value}</p>
              <p className="text-xs text-cosmic-dim">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-4">
          {[
            { value: "all", label: "全部" },
            { value: "psychologist", label: "心理咨询" },
          ].map((t) => <TabsTrigger key={t.value} value={t.value}>{t.label}</TabsTrigger>)}
        </TabsList>
        <TabsContent value={tab}>
          {filtered.length === 0 ? (
            <div className="py-20 text-center text-cosmic-muted">暂无订单记录</div>
          ) : (
            <div className="space-y-3">
              {filtered.map((o) => (
                <div key={o.id} className="cosmic-card p-4 transition-all hover:-translate-y-0.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-white">{o.psychologistName}</h3>
                      <p className="text-sm text-cosmic-muted">就诊人: {o.patientName}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={STATUS_VARIANTS[o.status]}>{o.status}</Badge>
                      {(o.status === "进行中" || o.status === "已预约") && (
                        <Button
                          variant="primary"
                          size="xs"
                          onClick={() => router.push(`/consultation/chat/${o.id}`)}
                        >
                          <MessageCircle className="size-3.5 mr-1" />
                          {o.type === "线上咨询" ? "进入咨询" : "详情"}
                        </Button>
                      )}
                      <Button variant="ghost" size="xs" onClick={() => { setDetail(o); setDetailOpen(true); }}>
                        <Eye className="size-3.5 mr-1" />详情
                      </Button>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-4 text-xs text-cosmic-dim">
                    <span>{o.date} {o.time}</span>
                    <span>{o.type}</span>
                    <span className="font-semibold text-cosmic-gold">¥{o.fee}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="!max-w-lg">
          <DialogTitle>订单详情</DialogTitle>
          {detail && (
            <div className="space-y-4">
              <div className="rounded-lg bg-white/5 p-4 space-y-2">
                {[
                  { label: "咨询师", value: detail.psychologistName },
                  { label: "就诊人", value: detail.patientName },
                  { label: "咨询方式", value: detail.type },
                  { label: "预约时间", value: `${detail.date} ${detail.time}` },
                  { label: "订单金额", value: `¥${detail.fee}` },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between text-sm">
                    <span className="text-cosmic-dim">{row.label}</span>
                    <span className="text-white">{row.value}</span>
                  </div>
                ))}
                <div className="flex justify-between text-sm pt-1 border-t border-white/5">
                  <span className="text-cosmic-dim">状态</span>
                  <Badge variant={STATUS_VARIANTS[detail.status]}>{detail.status}</Badge>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
