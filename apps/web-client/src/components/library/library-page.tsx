"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { BookOpen, Eye, Clock, Search, Filter } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import type { LibraryItem, LibraryItemType } from "@/lib/types";

const TABS: { value: string; label: string; type: LibraryItemType | "全部" }[] = [
  { value: "all", label: "全部", type: "全部" },
  { value: "articles", label: "文章", type: "文章" },
  { value: "courses", label: "课程", type: "课程" },
  { value: "books", label: "书籍", type: "书籍" },
  { value: "community", label: "社区", type: "社区" },
];

export function LibraryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") ?? "all";
  const [tab, setTab] = useState(initialTab);
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = useCallback(async (type: string) => {
    setLoading(true);
    try {
      let result;
      switch (type) {
        case "articles":
          result = await api.content.articles();
          break;
        case "courses":
          result = await api.content.courses();
          break;
        case "books":
          result = await api.content.books();
          break;
        case "community":
          result = await api.content.communityArticles();
          break;
        default: {
          const [a, c, b, cm] = await Promise.all([
            api.content.articles(),
            api.content.courses(),
            api.content.books(),
            api.content.communityArticles(),
          ]);
          result = {
            records: [...a.records, ...c.records, ...b.records, ...cm.records],
            total: a.total + c.total + b.total + cm.total,
          };
        }
      }
      setItems(result.records);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems(tab);
  }, [tab, fetchItems]);

  const handleTabChange = (value: string) => {
    setTab(value);
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete("tab");
    } else {
      params.set("tab", value);
    }
    router.replace(`/library?${params.toString()}`, { scroll: false });
  };

  const currentTab = TABS.find((t) => t.value === tab) ?? TABS[0];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:py-12">
      <h1 className="cosmic-page-title mb-8 text-2xl">内容馆</h1>

      <Tabs value={tab} onValueChange={handleTabChange}>
        <TabsList className="mb-8 inline-flex">
          {TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={tab} className="space-y-0">
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="cosmic-card p-5">
                  <Skeleton className="mb-3 h-5 w-20" />
                  <Skeleton className="mb-2 h-6 w-3/4" />
                  <Skeleton className="mb-1 h-4 w-full" />
                  <Skeleton className="mb-1 h-4 w-5/6" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="py-20 text-center text-cosmic-muted">
              <BookOpen className="mx-auto mb-4 size-12 opacity-30" />
              <p>暂无{currentTab.label}内容</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <Link
                  key={item.id}
                  href={
                    item.type === "书籍"
                      ? `/library/book/${item.id}`
                      : `/library/article/${item.id}`
                  }
                >
                  <div className="cosmic-card group cursor-pointer p-5 transition-all duration-300 hover:-translate-y-1">
                    <div className="mb-3 flex items-center gap-2">
                      <span className="cosmic-tag text-xs">{item.tag}</span>
                      <span className="text-xs text-cosmic-dim">{item.type}</span>
                    </div>
                    <h3 className="mb-2 font-semibold text-white group-hover:text-cosmic-nav-hover transition-colors">
                      {item.title}
                    </h3>
                    <p className="mb-3 line-clamp-2 text-sm text-cosmic-muted">
                      {item.summary}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-cosmic-dim">
                      <span>{item.author}</span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="size-3" />
                        {item.readTime}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Eye className="size-3" />
                        {item.views}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
