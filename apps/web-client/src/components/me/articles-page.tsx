"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Eye, Heart, MessageCircle, Clock, Pencil } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";

const STATUS_TABS = [
  { value: "all", label: "全部", status: undefined as number | undefined },
  { value: "pending", label: "待审核", status: 0 },
  { value: "published", label: "已发布", status: 1 },
  { value: "removed", label: "已下架", status: 2 },
];

type ArticleItem = {
  id: number;
  title: string;
  coverUrl?: string;
  status: number;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  createTime: string;
};

export function ArticlesPage() {
  const [tab, setTab] = useState("all");
  const [allItems, setAllItems] = useState<ArticleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setLoading(true);
    api.content.myArticles({ page, size: 10 })
      .then((r) => {
        const items = r.records as unknown as ArticleItem[];
        setAllItems(items);
        setTotal(r.total);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page]);

  const statusFilter = STATUS_TABS.find((t) => t.value === tab)?.status;
  const items = statusFilter !== undefined
    ? allItems.filter((item) => item.status === statusFilter)
    : allItems;

  const statusLabel = (s: number) => {
    if (s === 0) return { text: "待审核", variant: "secondary" as const };
    if (s === 1) return { text: "已发布", variant: "success" as const };
    return { text: "已下架", variant: "secondary" as const };
  };

  if (loading) {
    return <div className="space-y-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}</div>;
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">我的发布</h1>
        <Link href="/me/publish">
          <Button variant="primary" size="xs">
            <Pencil className="size-3.5 mr-1" />发布文章
          </Button>
        </Link>
      </div>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-6">
          {STATUS_TABS.map((t) => <TabsTrigger key={t.value} value={t.value}>{t.label}</TabsTrigger>)}
        </TabsList>
        <TabsContent value={tab}>
          {items.length === 0 ? (
            <div className="py-20 text-center text-cosmic-muted">暂无内容</div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => {
                const s = statusLabel(item.status);
                return (
                  <div key={item.id} className="cosmic-card flex items-center gap-4 p-4">
                    {item.coverUrl && <img src={item.coverUrl} alt="" className="size-16 rounded-lg object-cover shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <Link href={`/library/article/${item.id}`} className="font-medium text-white hover:text-cosmic-sky transition-colors line-clamp-1">
                        {item.title}
                      </Link>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-cosmic-dim">
                        <Badge variant={s.variant} className="text-xs">{s.text}</Badge>
                        <span className="inline-flex items-center gap-1"><Eye className="size-3" />{item.viewCount}</span>
                        <span className="inline-flex items-center gap-1"><Heart className="size-3" />{item.likeCount}</span>
                        <span className="inline-flex items-center gap-1"><MessageCircle className="size-3" />{item.commentCount}</span>
                        <span className="inline-flex items-center gap-1"><Clock className="size-3" />{item.createTime}</span>
                      </div>
                    </div>
                    <Link href={`/library/article/${item.id}`}><Button variant="ghost" size="xs">查看</Button></Link>
                  </div>
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
