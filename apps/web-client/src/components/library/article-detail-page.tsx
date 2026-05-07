"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, Eye, User } from "lucide-react";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import type { LibraryItem } from "@/lib/types";

export function ArticleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<LibraryItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.content.articles().then((result) => {
      const found = result.records.find((a) => a.id === Number(id));
      setItem(found ?? null);
    }).catch(() => setItem(null)).finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 md:py-12">
        <Skeleton className="mb-4 h-5 w-24" />
        <Skeleton className="mb-2 h-8 w-3/4" />
        <Skeleton className="mb-6 h-4 w-full" />
        <Skeleton className="mb-2 h-4 w-full" />
        <Skeleton className="mb-2 h-4 w-5/6" />
        <Skeleton className="h-4 w-4/5" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p className="text-lg text-cosmic-muted">文章不存在或已下架</p>
        <Link href="/library" className="mt-4 inline-block text-cosmic-sky hover:underline">
          返回内容馆
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:py-12">
      <Link
        href="/library?tab=articles"
        className="mb-6 inline-flex items-center gap-1 text-sm text-cosmic-muted hover:text-cosmic-sky transition-colors"
      >
        <ArrowLeft className="size-4" />
        返回内容馆
      </Link>

      <span className="cosmic-tag mb-4 inline-block text-xs">{item.tag}</span>
      <h1 className="mb-4 text-3xl font-bold text-white md:text-4xl">{item.title}</h1>

      <div className="mb-8 flex flex-wrap items-center gap-4 text-sm text-cosmic-dim">
        <span className="inline-flex items-center gap-1">
          <User className="size-4" />
          {item.author}
        </span>
        <span className="inline-flex items-center gap-1">
          <Clock className="size-4" />
          {item.readTime}
        </span>
        <span className="inline-flex items-center gap-1">
          <Eye className="size-4" />
          {item.views} 次阅读
        </span>
      </div>

      <div className="cosmic-card p-6 md:p-8">
        <p className="leading-relaxed text-cosmic-muted">{item.summary}</p>
        <div className="mt-8 border-t border-white/10 pt-6">
          <p className="text-sm text-cosmic-dim">
            完整内容请通过文章列表访问。我们正在完善文章详情接口。
          </p>
        </div>
      </div>
    </div>
  );
}
