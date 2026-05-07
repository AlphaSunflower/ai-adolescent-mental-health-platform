"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { BookOpen, Eye, Clock, Search, ChevronLeft, ChevronRight, Tag } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import type { LibraryItem, LibraryItemType } from "@/lib/types";

const PAGE_SIZE = 12;

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
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const fetchItems = useCallback(async (type: string, currentPage: number, searchKeyword?: string) => {
    setLoading(true);
    try {
      let result;
      switch (type) {
        case "articles":
          result = await api.content.articles({ page: currentPage, size: PAGE_SIZE });
          break;
        case "courses":
          result = await api.content.courses({ page: currentPage, size: PAGE_SIZE });
          break;
        case "books":
          result = await api.content.books({ page: currentPage, size: PAGE_SIZE, keyword: searchKeyword || undefined });
          break;
        case "community":
          result = await api.content.communityArticles({ page: currentPage, size: PAGE_SIZE });
          break;
        default: {
          const [a, c, b, cm] = await Promise.all([
            api.content.articles({ page: 1, size: 6 }),
            api.content.courses({ page: 1, size: 6 }),
            api.content.books({ page: 1, size: 6 }),
            api.content.communityArticles({ page: 1, size: 6 }),
          ]);
          result = {
            records: [...a.records, ...c.records, ...b.records, ...cm.records],
            total: a.total + c.total + b.total + cm.total,
          };
        }
      }
      setItems(result.records);
      setTotal(result.total);
    } catch {
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems(tab, page, keyword || undefined);
  }, [tab, page, keyword, fetchItems]);

  const handleTabChange = (value: string) => {
    setTab(value);
    setPage(1);
    setKeyword("");
    setSearchInput("");
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete("tab");
    } else {
      params.set("tab", value);
    }
    router.replace(`/library?${params.toString()}`, { scroll: false });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setKeyword(searchInput.trim());
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setPage(1);
    setKeyword("");
  };

  const goToPage = (p: number) => {
    if (p < 1 || p > totalPages) return;
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const currentTab = TABS.find((t) => t.value === tab) ?? TABS[0];
  const isBookTab = tab === "books";

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

        {/* Book search */}
        {isBookTab && (
          <form onSubmit={handleSearch} className="mb-6 flex gap-2">
            <div className="flex flex-1 max-w-md">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="搜索书籍..."
                className="cosmic-input flex-1 rounded-lg rounded-r-none bg-white/10 px-4 py-2 text-sm"
              />
              <button
                type="submit"
                className="flex items-center justify-center rounded-lg rounded-l-none bg-cosmic-blue/60 px-4 text-white hover:bg-cosmic-blue/80 transition-colors"
              >
                <Search className="size-4" />
              </button>
            </div>
            {keyword && (
              <Button variant="ghost" size="sm" onClick={handleClearSearch}>
                清除
              </Button>
            )}
          </form>
        )}

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
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => (
                  <Link
                    key={`${item.type}-${item.id}`}
                    href={
                      item.type === "书籍"
                        ? `/library/book/${item.id}`
                        : `/library/article/${item.id}`
                    }
                  >
                    <div className="cosmic-card group cursor-pointer overflow-hidden p-5 transition-all duration-300 hover:-translate-y-1">
                      {/* Cover image */}
                      {item.coverUrl && (
                        <div className="mb-4 overflow-hidden rounded-lg">
                          <img
                            src={item.coverUrl}
                            alt={item.title}
                            className="h-40 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                      )}

                      {/* Tags */}
                      <div className="mb-3 flex items-center gap-2">
                        <span className="cosmic-tag text-xs">{item.tag}</span>
                        <Badge variant="secondary" className="text-xs">{item.type}</Badge>
                      </div>

                      <h3 className="mb-2 font-semibold text-white group-hover:text-cosmic-nav-hover transition-colors line-clamp-2">
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => goToPage(page - 1)}
                    disabled={page <= 1}
                  >
                    <ChevronLeft className="size-4" />
                  </Button>

                  {Array.from({ length: totalPages }).map((_, i) => {
                    const pageNum = i + 1;
                    const isCurrent = pageNum === page;
                    // Show first, last, current, and pages around current
                    const showPage =
                      pageNum === 1 ||
                      pageNum === totalPages ||
                      Math.abs(pageNum - page) <= 2;
                    const showEllipsisBefore =
                      pageNum === 2 && page > 4;
                    const showEllipsisAfter =
                      pageNum === totalPages - 1 && page < totalPages - 3;

                    if (!showPage) {
                      if (showEllipsisBefore || showEllipsisAfter) {
                        return <span key={pageNum} className="px-1 text-cosmic-dim text-sm">…</span>;
                      }
                      return null;
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={isCurrent ? "primary" : "ghost"}
                        size="icon-sm"
                        onClick={() => goToPage(pageNum)}
                        className={isCurrent ? "" : "text-cosmic-dim hover:text-white"}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}

                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => goToPage(page + 1)}
                    disabled={page >= totalPages}
                  >
                    <ChevronRight className="size-4" />
                  </Button>

                  <span className="ml-4 text-xs text-cosmic-dim">
                    共 {total} 条
                  </span>
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
