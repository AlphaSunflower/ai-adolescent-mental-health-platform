"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/pouf/Badge";
import { Skeleton } from "@/components/pouf/Skeleton";
import { Card } from "@/components/pouf/Card";
import { api } from "@/lib/api";

type PlatformFeedback = {
  id: number;
  content: string;
  status: number;
  cancelReason?: string;
  createTime: string;
};

const platformStatusLabel = (s: number) => {
  const map: Record<number, { text: string; variant: "secondary" | "success" | "warning" | "destructive" }> = {
    0: { text: "已反馈", variant: "secondary" },
    1: { text: "待解决", variant: "warning" },
    2: { text: "已解决", variant: "success" },
    3: { text: "已取消", variant: "destructive" },
  };
  return map[s] ?? { text: "未知", variant: "secondary" };
};

export function FeedbackPage() {
  const [platformItems, setPlatformItems] = useState<PlatformFeedback[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.feedback
      .platform()
      .then((r) => setPlatformItems(r.records as PlatformFeedback[]))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="mb-6 text-xl font-black text-ink">我的反馈</h1>
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}
        </div>
      ) : platformItems.length === 0 ? (
        <div className="py-20 text-center text-muted">暂无平台反馈</div>
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-purple/10 text-left text-muted/70">
                <th className="px-4 py-3 font-medium">反馈内容</th>
                <th className="px-4 py-3 font-medium w-[100px]">状态</th>
                <th className="px-4 py-3 font-medium w-[180px]">取消理由</th>
                <th className="px-4 py-3 font-medium w-[180px]">提交时间</th>
              </tr>
            </thead>
            <tbody>
              {platformItems.map((item) => {
                const s = platformStatusLabel(item.status);
                return (
                  <tr key={item.id} className="border-b border-purple/10 last:border-0">
                    <td className="px-4 py-3 text-ink">{item.content}</td>
                    <td className="px-4 py-3"><Badge variant={s.variant} className="text-xs">{s.text}</Badge></td>
                    <td className="px-4 py-3 text-muted/70">{item.status === 3 ? item.cancelReason ?? "-" : "-"}</td>
                    <td className="px-4 py-3 text-muted/70">{item.createTime}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
