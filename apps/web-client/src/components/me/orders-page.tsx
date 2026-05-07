"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
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
  const [orders, setOrders] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.appointment.my()
      .then((r) => setOrders(r.records))
      .catch(() => toast.error("加载订单失败"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:py-12">
      <h1 className="cosmic-page-title mb-8 text-2xl">我的订单</h1>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="cosmic-card p-4">
              <Skeleton className="mb-2 h-5 w-40" />
              <Skeleton className="mb-1 h-4 w-full" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="cosmic-card p-12 text-center">
          <p className="text-cosmic-muted">暂无订单记录</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <div key={o.id} className="cosmic-card p-4 transition-all hover:-translate-y-0.5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-white">{o.psychologistName}</h3>
                  <p className="text-sm text-cosmic-muted">就诊人: {o.patientName}</p>
                </div>
                <Badge variant={STATUS_VARIANTS[o.status]}>{o.status}</Badge>
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
    </div>
  );
}
