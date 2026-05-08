"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { InteractionItem } from "@ai-adolescent-mental-health/domain";

export function LikesPage() {
  const [items, setItems] = useState<InteractionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [cancelling, setCancelling] = useState<number | null>(null);

  useEffect(() => {
    setLoading(true);
    api.user.myLikes({ page, size: 10 })
      .then((r) => { setItems(r.records); setTotal(r.total); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page]);

  const handleCancel = async (item: InteractionItem) => {
    setCancelling(item.articleId);
    try {
      await api.content.interact(item.articleId, 1);
      toast.success("已取消点赞");
      setItems((prev) => prev.filter((i) => i.articleId !== item.articleId));
      setTotal((t) => t - 1);
    } catch {
      toast.error("操作失败");
    } finally {
      setCancelling(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold text-white">我的点赞</h1>
      {items.length === 0 ? (
        <div className="py-20 text-center text-cosmic-muted">暂无点赞</div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.articleId} className="cosmic-card flex items-center gap-4 p-4">
              {item.coverUrl && (
                <img src={item.coverUrl} alt="" className="size-16 rounded-lg object-cover shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <Link
                  href={`/library/article/${item.articleId}`}
                  className="font-medium text-white hover:text-cosmic-sky transition-colors line-clamp-1"
                >
                  {item.articleTitle}
                </Link>
                <div className="mt-1 flex items-center gap-3 text-xs text-cosmic-dim">
                  <span>{item.authorNickname}</span>
                  <span>{item.createTime}</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="xs"
                onClick={() => handleCancel(item)}
                disabled={cancelling === item.articleId}
              >
                <ThumbsUp className="size-3.5 mr-1" />
                {cancelling === item.articleId ? "..." : "取消点赞"}
              </Button>
            </div>
          ))}
        </div>
      )}
      {total > 10 && (
        <div className="mt-4 flex justify-center gap-2">
          <Button variant="ghost" size="icon-sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>‹</Button>
          <span className="self-center text-sm text-cosmic-dim">{page} / {Math.ceil(total / 10)}</span>
          <Button variant="ghost" size="icon-sm" disabled={page * 10 >= total} onClick={() => setPage((p) => p + 1)}>›</Button>
        </div>
      )}
    </div>
  );
}
