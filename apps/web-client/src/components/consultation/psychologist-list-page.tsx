"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Star, MapPin, Clock, Filter, Search } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import type { Psychologist } from "@/lib/types";

export function PsychologistListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCity = searchParams.get("city") ?? "";

  const [psychologists, setPsychologists] = useState<Psychologist[]>([]);
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState(initialCity);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 12;

  const fetchList = useCallback(async (p: number, c: string) => {
    setLoading(true);
    try {
      const query: Record<string, string | number> = { page: p, size: pageSize };
      if (c) query.city = c;
      const result = await api.psychologist.list(query);
      setPsychologists(result.records);
      setTotal(result.total);
    } catch {
      toast.error("加载咨询师列表失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchList(page, city);
  }, [page, city, fetchList]);

  const handleCityFilter = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (city) params.set("city", city);
    else params.delete("city");
    router.replace(`/consultation/psychologist?${params.toString()}`, { scroll: false });
    setPage(1);
    fetchList(1, city);
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:py-12">
      <h1 className="cosmic-page-title mb-8 text-2xl">心理咨询师</h1>

      {/* Filters */}
      <div className="cosmic-card mb-8 flex flex-wrap items-center gap-3 p-4">
        <div className="flex items-center gap-2">
          <Filter className="size-4 text-cosmic-dim" />
          <Input
            placeholder="城市筛选"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCityFilter()}
            className="w-36"
          />
          <Button variant="outline" size="xs" onClick={handleCityFilter}>筛选</Button>
        </div>
        {city && (
          <span className="text-xs text-cosmic-muted">
            当前城市: <span className="text-cosmic-gold">{city}</span>
            <button
              type="button"
              onClick={() => { setCity(""); setPage(1); }}
              className="ml-1 text-cosmic-dim hover:text-white"
            >
              ✕
            </button>
          </span>
        )}
        <span className="ml-auto text-xs text-cosmic-dim">共 {total} 位咨询师</span>
      </div>

      {/* List */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="cosmic-card p-5">
              <Skeleton className="mb-3 size-16 rounded-full" />
              <Skeleton className="mb-2 h-5 w-32" />
              <Skeleton className="mb-1 h-4 w-full" />
              <Skeleton className="mb-1 h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : psychologists.length === 0 ? (
        <div className="py-20 text-center text-cosmic-muted">
          <Search className="mx-auto mb-4 size-12 opacity-30" />
          <p>暂无符合条件的咨询师</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {psychologists.map((p) => (
              <Link key={p.id} href={`/consultation/psychologist/${p.id}`}>
                <div className="cosmic-card group cursor-pointer p-5 transition-all duration-300 hover:-translate-y-1">
                  <div className="mb-4 flex items-start gap-4">
                    <div className="size-16 shrink-0 rounded-full bg-cosmic-blue/20 flex items-center justify-center">
                      {p.avatar ? (
                        <img src={p.avatar} alt={p.name} className="size-16 rounded-full object-cover" />
                      ) : (
                        <span className="text-2xl font-bold text-cosmic-sky">{p.name[0]}</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-white">{p.name}</h3>
                      <p className="text-xs text-cosmic-muted">{p.title}</p>
                      <div className="mt-1 flex items-center gap-1 text-xs text-cosmic-gold">
                        <Star className="size-3 fill-current" />
                        {p.rating}
                      </div>
                    </div>
                  </div>

                  <div className="mb-3 flex flex-wrap gap-1.5">
                    {p.fields.slice(0, 3).map((f) => (
                      <span key={f} className="cosmic-tag text-xs">{f}</span>
                    ))}
                  </div>

                  <p className="mb-3 line-clamp-2 text-sm text-cosmic-muted">{p.intro}</p>

                  <div className="flex items-center justify-between text-xs text-cosmic-dim">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="size-3" />{p.city}
                    </span>
                    <span className="font-semibold text-cosmic-gold">
                      ¥{p.onlinePrice ?? p.price}/次
                    </span>
                  </div>

                  {p.availableToday && (
                    <Badge variant="gold" className="mt-3 text-xs">
                      <Clock className="mr-1 size-3" />今日可约
                    </Badge>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="xs"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                上一页
              </Button>
              <span className="text-sm text-cosmic-muted">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="xs"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                下一页
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
