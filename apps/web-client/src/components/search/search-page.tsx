"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Clock, Flame, X, Eye, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/pouf/Input";
import { Button } from "@/components/pouf/Button";
import { Badge } from "@/components/pouf/Badge";
import { Skeleton } from "@/components/pouf/Skeleton";
import { Card } from "@/components/pouf/Card";
import { httpClient } from "@/lib/api";

interface SearchResultItem {
  id: number;
  articleType?: "official" | "user";
  userId?: number;
  type: "article" | "course";
  title: string;
  description: string;
  coverImage?: string;
  author?: string;
  createTime: string;
  viewCount: number;
  likeCount: number;
  category?: string;
  tags?: string[];
  duration?: number;
  price?: number;
  isFree?: boolean;
}

export function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialKeyword = searchParams.get("q") ?? "";

  const [keyword, setKeyword] = useState(initialKeyword);
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hotKeywords, setHotKeywords] = useState<string[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    loadHotKeywords();
    loadHistory();
  }, []);

  useEffect(() => {
    if (initialKeyword) {
      performSearch(initialKeyword);
    }
  }, [initialKeyword]);

  const loadHotKeywords = async () => {
    try {
      const res = await httpClient.get<string[]>("/search/hot-keywords");
      setHotKeywords(res ?? []);
    } catch { /* ignore */ }
  };

  const loadHistory = async () => {
    try {
      const res = await httpClient.get<string[]>("/search/history");
      setSearchHistory(res ?? []);
    } catch { /* ignore */ }
  };

  const performSearch = useCallback(async (kw: string) => {
    if (!kw.trim()) return;
    setLoading(true);
    setHasSearched(true);
    try {
      const res = await httpClient.get<{ total: number; data: SearchResultItem[] }>(
        "/search/global",
        { query: { keyword: kw.trim(), pageNum: "1", pageSize: "20" } },
      );
      setResults(res.data ?? []);
      setTotal(res.total ?? 0);
      try { await httpClient.post("/search/history", JSON.stringify(kw.trim())); } catch { /* ignore */ }
      loadHistory();
    } catch {
      toast.error("搜索失败，请重试");
      setResults([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!keyword.trim()) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("q", keyword.trim());
    router.replace(`/search?${params.toString()}`, { scroll: false });
    performSearch(keyword.trim());
  };

  const handleHistoryClick = (kw: string) => {
    setKeyword(kw);
    const params = new URLSearchParams();
    params.set("q", kw);
    router.replace(`/search?${params.toString()}`, { scroll: false });
    performSearch(kw);
  };

  const clearHistory = async () => {
    try {
      await httpClient.delete("/search/history");
      setSearchHistory([]);
      toast.success("已清空搜索历史");
    } catch { toast.error("清除失败"); }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:py-12">
      {/* Search Box */}
      <div className="mx-auto mb-12 max-w-2xl">
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted/70" />
            <Input
              type="text"
              placeholder="搜索文章、课程..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit" tone="purple" variant="solid" disabled={loading}>
            {loading ? "搜索中..." : "搜索"}
          </Button>
        </form>
      </div>

      {/* Initial state: hot keywords + history */}
      {!hasSearched && !initialKeyword && (
        <div className="mx-auto max-w-2xl">
          {/* Hot Keywords */}
          {hotKeywords.length > 0 && (
            <Card className="mb-6 p-5">
              <h3 className="mb-3 inline-flex items-center gap-2 text-sm font-bold text-ink">
                <Flame className="size-4 text-orange" />
                热门搜索
              </h3>
              <div className="flex flex-wrap gap-2">
                {hotKeywords.map((kw) => (
                  <button
                    key={kw}
                    type="button"
                    onClick={() => handleHistoryClick(kw)}
                    className="rounded-pill border border-[rgba(201,168,255,0.3)] bg-purple/10 px-3 py-1 text-sm font-bold text-muted hover:border-yellow/60 hover:text-yellow transition-colors"
                  >
                    {kw}
                  </button>
                ))}
              </div>
            </Card>
          )}

          {/* Search History */}
          {searchHistory.length > 0 && (
            <Card className="p-5">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="inline-flex items-center gap-2 text-sm font-bold text-ink">
                  <Clock className="size-4 text-muted/70" />
                  搜索历史
                </h3>
                <button
                  type="button"
                  onClick={clearHistory}
                  className="text-xs text-muted/70 hover:text-muted transition-colors"
                >
                  清空
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {searchHistory.map((kw) => (
                  <button
                    key={kw}
                    type="button"
                    onClick={() => handleHistoryClick(kw)}
                    className="rounded-pill border border-[rgba(201,168,255,0.3)] bg-purple/10 px-3 py-1 text-sm font-bold text-muted hover:text-ink transition-colors"
                  >
                    {kw}
                  </button>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Search Results */}
      {hasSearched && (
        <div>
          <div className="mb-6 flex items-center gap-2 text-sm text-muted">
            <span>找到 <span className="text-yellow">{total}</span> 条结果</span>
          </div>

          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Card key={i} className="p-4">
                  <Skeleton className="mb-2 h-5 w-3/4" />
                  <Skeleton className="mb-1 h-4 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                </Card>
              ))}
            </div>
          ) : results.length === 0 ? (
            <div className="py-20 text-center text-muted">
              <Search className="mx-auto mb-4 size-12 opacity-30" />
              <p>未找到相关结果，试试其他关键词</p>
            </div>
          ) : (
            <div className="space-y-4">
              {results.map((item) => (
                <Link
                  key={`${item.type}-${item.id}`}
                  href={
                    item.type === "course"
                      ? `/library?tab=courses`
                      : item.articleType === "user" && item.userId
                        ? `/user/${item.userId}/article/${item.id}`
                        : `/library/article/${item.id}`
                  }
                >
                  <Card className="group cursor-pointer p-4 transition-all duration-300 hover:-translate-y-1">
                    <div className="mb-2 flex items-center gap-2">
                      <Badge variant={item.type === "course" ? "gold" : "secondary"} className="text-xs">
                        {item.type === "course" ? "课程" : "文章"}
                      </Badge>
                      {item.category && (
                        <span className="text-xs text-muted/70">{item.category}</span>
                      )}
                      {item.isFree && (
                        <span className="text-xs text-mint">免费</span>
                      )}
                    </div>
                    <h3 className="mb-1 font-bold text-ink group-hover:text-purple transition-colors">
                      {item.title}
                    </h3>
                    <p className="mb-2 line-clamp-2 text-sm text-muted">{item.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted/70">
                      {item.author && <span>{item.author}</span>}
                      <span>{item.createTime}</span>
                      <span className="inline-flex items-center gap-1">
                        <Eye className="size-3" />
                        {item.viewCount}
                      </span>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
