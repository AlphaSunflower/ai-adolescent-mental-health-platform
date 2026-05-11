"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, UserPlus, Heart, MessageCircle, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { api } from "@/lib/api";

type MessageItem = {
  id: number;
  title: string;
  content: string;
  sourceType: number;
  sourceId: number;
  extraType?: number;
  articleAuthorId?: number;
  fromUserId: number;
  fromUserNickname?: string;
  fromUserAvatar?: string;
  isRead: number;
  createTime: string;
};

const SOURCE_LABELS: Record<number, { text: string; variant: "secondary" | "success" | "warning" }> = {
  1: { text: "关注", variant: "warning" },
  2: { text: "文章点赞", variant: "success" },
  3: { text: "评论点赞", variant: "success" },
  4: { text: "回复", variant: "secondary" },
};

const SourceIcon = ({ type }: { type: number }) => {
  const cls = "size-5";
  switch (type) {
    case 1: return <UserPlus className={cls + " text-blue-400"} />;
    case 2: return <Heart className={cls + " text-red-400"} />;
    case 3: return <Heart className={cls + " text-pink-400"} />;
    case 4: return <MessageCircle className={cls + " text-green-400"} />;
    default: return <Bell className={cls + " text-cosmic-dim"} />;
  }
};

export function MessagesPage() {
  const [items, setItems] = useState<MessageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const router = useRouter();

  useEffect(() => {
    setLoading(true);
    api.message.list({ page, size: 10 })
      .then((r) => { setItems(r.records as MessageItem[]); setTotal(r.total); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page]);

  const handleClick = async (msg: MessageItem) => {
    if (msg.isRead === 0) {
      try {
        await api.message.markRead(msg.id);
        setItems((prev) => prev.map((m) => m.id === msg.id ? { ...m, isRead: 1 } : m));
      } catch { /* ignore */ }
    }

    if (msg.sourceType === 1 && msg.fromUserId) {
      router.push(`/user/${msg.fromUserId}`);
    } else if (msg.sourceId && (msg.sourceType === 2 || msg.sourceType === 3 || msg.sourceType === 4)) {
      if (msg.extraType === 1) {
        router.push(`/user/${msg.articleAuthorId}/article/${msg.sourceId}`);
      } else {
        router.push(`/library/article/${msg.sourceId}`);
      }
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.message.markAllRead();
      toast.success("已全部标记为已读");
      setItems((prev) => prev.map((m) => ({ ...m, isRead: 1 })));
    } catch {
      toast.error("操作失败");
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-32" />
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">我的消息</h1>
        <Button variant="outline" size="sm" onClick={handleMarkAllRead}>全部已读</Button>
      </div>

      {items.length === 0 ? (
        <div className="py-20 text-center text-cosmic-muted">暂无消息</div>
      ) : (
        <div className="space-y-2">
          {items.map((msg) => {
            const src = SOURCE_LABELS[msg.sourceType];
            return (
              <button
                key={msg.id}
                onClick={() => handleClick(msg)}
                className={`cosmic-card flex items-center gap-4 p-4 w-full text-left transition-colors ${
                  msg.isRead === 0 ? "ring-1 ring-cosmic-blue/30" : ""
                }`}
              >
                <div className="size-10 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                  {msg.fromUserAvatar ? (
                    <img src={msg.fromUserAvatar} alt="" className="size-10 rounded-full object-cover" />
                  ) : (
                    <SourceIcon type={msg.sourceType} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white text-sm">{msg.title}</span>
                    {src && <Badge variant={src.variant} className="text-xs">{src.text}</Badge>}
                  </div>
                  <p className="mt-0.5 text-xs text-cosmic-dim line-clamp-1">{msg.content}</p>
                  <span className="mt-1 text-xs text-cosmic-dim">{msg.createTime}</span>
                </div>
                {msg.isRead === 0 && <div className="size-2 rounded-full bg-cosmic-blue shrink-0" />}
              </button>
            );
          })}
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
