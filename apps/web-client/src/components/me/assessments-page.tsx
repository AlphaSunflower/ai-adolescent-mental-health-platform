"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { api } from "@/lib/api";

type RecordItem = {
  id: number;
  title: string;
  score: number;
  result: string;
  createTime: string;
};

export function AssessmentsPage() {
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState<Record<string, unknown> | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.assessment.records()
      .then((r) => { setRecords(r.records); setTotal(r.total); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page]);

  const viewDetail = async (id: number) => {
    setDetailLoading(true);
    setDetailOpen(true);
    try {
      const d = await api.assessment.recordDetail(id);
      setDetail(d);
    } catch {
      toast.error("加载详情失败");
    } finally {
      setDetailLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold text-white">我的测评记录</h1>

      {records.length === 0 ? (
        <div className="py-20 text-center text-cosmic-muted">暂无测评记录</div>
      ) : (
        <>
          <div className="cosmic-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-left text-cosmic-dim">
                  <th className="px-4 py-3 font-medium">测评量表</th>
                  <th className="px-4 py-3 font-medium">测评时间</th>
                  <th className="px-4 py-3 font-medium">得分</th>
                  <th className="px-4 py-3 font-medium w-[120px]">操作</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id} className="border-b border-white/5 last:border-0">
                    <td className="px-4 py-3 text-white">{r.title}</td>
                    <td className="px-4 py-3 text-cosmic-dim">{r.createTime}</td>
                    <td className="px-4 py-3">
                      <Badge variant="success" className="text-xs">{r.score}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Button variant="ghost" size="xs" onClick={() => viewDetail(r.id)}>查看详情</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {total > 20 && (
            <div className="mt-4 flex justify-center gap-2">
              <Button variant="ghost" size="icon-sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>‹</Button>
              <span className="self-center text-sm text-cosmic-dim">{page} / {Math.ceil(total / 20)}</span>
              <Button variant="ghost" size="icon-sm" disabled={page * 20 >= total} onClick={() => setPage((p) => p + 1)}>›</Button>
            </div>
          )}
        </>
      )}

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="!max-w-lg">
          <DialogTitle>测评报告</DialogTitle>
          {detailLoading ? (
            <div className="space-y-3 py-6">
              <Skeleton className="h-6 w-48 mx-auto" />
              <Skeleton className="h-4 w-32 mx-auto" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : detail ? (
            <div className="space-y-4">
              <h3 className="text-center text-lg font-bold text-white">
                {(detail.templateTitle ?? detail.title) as string}
              </h3>
              <div className="flex justify-between rounded-lg bg-white/5 px-4 py-3 text-sm">
                <span className="text-cosmic-dim">测评时间：{(detail.record as Record<string, unknown>)?.createTime as string ?? detail.createTime as string}</span>
                <span className="text-cosmic-dim">
                  总得分：<strong className="text-cosmic-gold text-lg">{(detail.record as Record<string, unknown>)?.resultScore as number ?? detail.score as number}</strong>
                </span>
              </div>
              <div className="rounded-lg border-l-4 border-cosmic-blue/50 bg-cosmic-blue/5 p-4">
                <h4 className="mb-2 font-medium text-cosmic-sky">结果分析</h4>
                <p className="text-sm leading-relaxed text-cosmic-muted">
                  {(detail.record as Record<string, unknown>)?.resultAnalysis as string ?? detail.result as string ?? "暂无分析"}
                </p>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
