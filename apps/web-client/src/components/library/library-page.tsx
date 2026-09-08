"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  BookOpen, Eye, Clock, Search, ChevronLeft, ChevronRight,
  LayoutGrid, Smile, GraduationCap, MessageCircle,
} from "lucide-react";
import { Skeleton } from "@/components/pouf/Skeleton";
import { Button, IconButton } from "@/components/pouf/Button";
import { Badge } from "@/components/pouf/Badge";
import { Card } from "@/components/pouf/Card";
import { Input } from "@/components/pouf/Input";
import { api } from "@/lib/api";
import type { LibraryItem, LibraryItemType } from "@/lib/types";

const PAGE_SIZE = 12;

const SIDEBAR_ITEMS: { value: string; label: string; type: LibraryItemType | "全部"; icon: typeof BookOpen }[] = [
  { value: "all", label: "全部", type: "全部", icon: LayoutGrid },
  { value: "articles", label: "情绪解忧馆", type: "文章", icon: Smile },
  { value: "courses", label: "心理研习社", type: "课程", icon: GraduationCap },
  { value: "books", label: "青春阅享", type: "书籍", icon: BookOpen },
  { value: "community", label: "心声广场", type: "社区", icon: MessageCircle },
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

  const handleNavClick = (value: string) => {
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

  const currentItem = SIDEBAR_ITEMS.find((t) => t.value === tab) ?? SIDEBAR_ITEMS[0];
  const isBookTab = tab === "books";

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:py-12">
      <h1 className="mb-8 text-2xl font-black text-ink">内容馆</h1>

      <div className="flex flex-col gap-6 md:flex-row">
        {/* Mobile filter tabs - horizontal scroll */}
        <div className="md:hidden -mx-4 px-4 overflow-x-auto scrollbar-hide">
          <nav className="flex gap-2 pb-2">
            {SIDEBAR_ITEMS.map((item) => {
              const isActive = tab === item.value;
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => handleNavClick(item.value)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm transition-colors whitespace-nowrap ${
                    isActive
                      ? "bg-purple/20 text-blue border border-blue/30"
                      : "bg-purple/10 text-muted border border-[rgba(201,168,255,0.3)] hover:bg-purple/15"
                  }`}
                >
                  <item.icon className="size-3.5 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-[180px] shrink-0">
          <nav className="cushion-card rounded-card bg-surface/85 sticky top-24 py-2">
            {SIDEBAR_ITEMS.map((item) => {
              const isActive = tab === item.value;
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => handleNavClick(item.value)}
                  className={`flex items-center gap-3 w-full px-4 py-3 text-sm transition-colors text-left ${
                    isActive
                      ? "bg-purple/10 text-blue border-r-2 border-blue"
                      : "text-muted hover:bg-purple/10 hover:text-ink"
                  }`}
                >
                  <item.icon className="size-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0">
          {/* Book search */}
          {isBookTab && (
            <form onSubmit={handleSearch} className="mb-6 flex gap-2">
              <div className="flex flex-1 max-w-md">
                <Input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="搜索书籍..."
                  className="flex-1 rounded-r-none"
                />
                <button
                  type="submit"
                  className="flex h-11 items-center justify-center rounded-control rounded-l-none bg-purple/60 px-4 text-ink transition-colors hover:bg-purple/80"
                >
                  <Search className="size-4" />
                </button>
              </div>
              {keyword && (
                <Button tone="purple" variant="quiet" size="sm" onClick={handleClearSearch}>
                  清除
                </Button>
              )}
            </form>
          )}

          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="p-5">
                  <Skeleton className="mb-3 h-5 w-20" />
                  <Skeleton className="mb-2 h-6 w-3/4" />
                  <Skeleton className="mb-1 h-4 w-full" />
                  <Skeleton className="mb-1 h-4 w-5/6" />
                  <Skeleton className="h-4 w-1/2" />
                </Card>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="py-20 text-center text-muted">
              <BookOpen className="mx-auto mb-4 size-12 opacity-30" />
              <p>暂无{currentItem.label}内容</p>
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 min-w-0">
                {items.map((item) => {
                  const isCourse = item.type === "课程";
                  const isBook = item.type === "书籍";
                  const isCommunity = item.type === "社区";
                  const href = isBook
                    ? `/library/book/${item.id}`
                    : isCommunity && item.authorId
                      ? `/user/${item.authorId}/article/${item.id}`
                      : `/library/article/${item.id}`;
                  const isExternal = isCourse && !!item.linkUrl;

                  const cardContent = (
                    <Card className="group cursor-pointer overflow-hidden p-5 transition-all duration-300 hover:-translate-y-1 w-full">
                      {item.coverUrl && (
                        <div className="mb-4 overflow-hidden rounded-lg">
                          <img
                            src={item.coverUrl}
                            alt={item.title}
                            className="h-40 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                      )}
                      <div className="mb-3 flex items-center gap-2">
                        <span className="rounded-control bg-purple/10 px-2 py-0.5 text-xs font-bold text-ink">{item.tag}</span>
                        <Badge variant="secondary" className="text-xs">{item.type}</Badge>
                      </div>
                      <h3 className="mb-2 font-bold text-ink group-hover:text-purple transition-colors line-clamp-2">
                        {item.title}
                      </h3>
                      <p className="mb-3 line-clamp-2 text-sm text-muted">
                        {item.summary}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted/70">
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
                    </Card>
                  );

                  if (isExternal) {
                    return (
                      <a
                        key={`${item.type}-${item.id}`}
                        href={item.linkUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block min-w-0"
                      >
                        {cardContent}
                      </a>
                    );
                  }

                  return (
                    <Link
                      key={`${item.type}-${item.id}`}
                      href={href}
                      className="block min-w-0"
                    >
                      {cardContent}
                    </Link>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
                  <IconButton
                    icon={<ChevronLeft className="size-4" />}
                    label="上一页"
                    variant="quiet"
                    size="sm"
                    onClick={() => goToPage(page - 1)}
                    disabled={page <= 1}
                  />

                  {Array.from({ length: totalPages }).map((_, i) => {
                    const pageNum = i + 1;
                    const isCurrent = pageNum === page;
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
                        return <span key={pageNum} className="px-1 text-muted/70 text-sm">…</span>;
                      }
                      return null;
                    }

                    return (
                      <Button
                        key={pageNum}
                        tone="purple"
                        variant={isCurrent ? "solid" : "quiet"}
                        size="sm"
                        onClick={() => goToPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}

                  <IconButton
                    icon={<ChevronRight className="size-4" />}
                    label="下一页"
                    variant="quiet"
                    size="sm"
                    onClick={() => goToPage(page + 1)}
                    disabled={page >= totalPages}
                  />

                  <span className="ml-4 text-xs text-muted/70">
                    共 {total} 条
                  </span>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
