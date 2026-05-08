"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";

type PlatformFeedback = {
  id: number;
  content: string;
  status: number;
  cancelReason?: string;
  createTime: string;
};

type ConsultationFeedback = {
  id: number;
  content: string;
  rating: number;
  status: number;
  replyContent?: string;
  rejectReason?: string;
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

const consultationStatusLabel = (s: number) => {
  const map: Record<number, { text: string; variant: "secondary" | "success" | "destructive" }> = {
    0: { text: "已反馈", variant: "secondary" },
    1: { text: "已接收", variant: "success" },
    2: { text: "已拒收", variant: "destructive" },
  };
  return map[s] ?? { text: "未知", variant: "secondary" };
};

export function FeedbackPage() {
  const [tab, setTab] = useState("platform");
  const [platformItems, setPlatformItems] = useState<PlatformFeedback[]>([]);
  const [consultationItems, setConsultationItems] = useState<ConsultationFeedback[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const p = tab === "platform"
      ? api.feedback.platform().then((r) => setPlatformItems(r.records as PlatformFeedback[]))
      : api.feedback.consultation().then((r) => setConsultationItems(r.records as ConsultationFeedback[]));
    p.catch(() => {}).finally(() => setLoading(false));
  }, [tab]);

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold text-white">我的反馈</h1>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="platform">平台反馈</TabsTrigger>
          <TabsTrigger value="consultation">咨询反馈</TabsTrigger>
        </TabsList>

        <TabsContent value={tab}>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}
            </div>
          ) : tab === "platform" ? (
            platformItems.length === 0 ? (
              <div className="py-20 text-center text-cosmic-muted">暂无平台反馈</div>
            ) : (
              <div className="cosmic-card overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/5 text-left text-cosmic-dim">
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
                        <tr key={item.id} className="border-b border-white/5 last:border-0">
                          <td className="px-4 py-3 text-white">{item.content}</td>
                          <td className="px-4 py-3"><Badge variant={s.variant} className="text-xs">{s.text}</Badge></td>
                          <td className="px-4 py-3 text-cosmic-dim">{item.status === 3 ? item.cancelReason ?? "-" : "-"}</td>
                          <td className="px-4 py-3 text-cosmic-dim">{item.createTime}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            consultationItems.length === 0 ? (
              <div className="py-20 text-center text-cosmic-muted">暂无咨询反馈</div>
            ) : (
              <div className="cosmic-card overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/5 text-left text-cosmic-dim">
                      <th className="px-4 py-3 font-medium">反馈内容</th>
                      <th className="px-4 py-3 font-medium w-[80px]">评分</th>
                      <th className="px-4 py-3 font-medium w-[100px]">状态</th>
                      <th className="px-4 py-3 font-medium">回复/理由</th>
                      <th className="px-4 py-3 font-medium w-[180px]">提交时间</th>
                    </tr>
                  </thead>
                  <tbody>
                    {consultationItems.map((item) => {
                      const s = consultationStatusLabel(item.status);
                      return (
                        <tr key={item.id} className="border-b border-white/5 last:border-0">
                          <td className="px-4 py-3 text-white">{item.content}</td>
                          <td className="px-4 py-3"><Badge variant="success" className="text-xs">{item.rating}</Badge></td>
                          <td className="px-4 py-3"><Badge variant={s.variant} className="text-xs">{s.text}</Badge></td>
                          <td className="px-4 py-3 text-cosmic-dim">
                            {item.status === 1 ? `回复: ${item.replyContent ?? "-"}` : item.status === 2 ? `拒收理由: ${item.rejectReason ?? "-"}` : "-"}
                          </td>
                          <td className="px-4 py-3 text-cosmic-dim">{item.createTime}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
