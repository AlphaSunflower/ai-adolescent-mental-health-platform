"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Star, MapPin, Clock, Search, RotateCcw, LayoutGrid, List, Heart,
  Medal, Phone, MessageCircle, Video, Users
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/pouf/Button";
import { Skeleton } from "@/components/pouf/Skeleton";
import { Card } from "@/components/pouf/Card";
import { api } from "@/lib/api";
import type { Psychologist } from "@/lib/types";

type ViewMode = "grid" | "list";
type SortBy = "default" | "rating" | "price";

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: "default", label: "综合推荐" },
  { value: "rating", label: "评分最高" },
  { value: "price", label: "价格最低" },
];

const SERVICE_TYPE_OPTIONS = [
  { value: "text", label: "图文咨询", icon: MessageCircle },
  { value: "video", label: "视频咨询", icon: Video },
  { value: "voice", label: "语音咨询", icon: Phone },
  { value: "offline", label: "线下面询", icon: Users },
];

function RatingStars({ value, size = "sm" }: { value: number; size?: "sm" | "md" }) {
  const stars = Math.round(value);
  return (
    <span className={`inline-flex items-center gap-0.5 ${size === "md" ? "text-base" : "text-xs"}`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={i < stars ? "text-yellow fill-current" : "text-muted/40"}
          style={size === "md" ? { width: 18, height: 18 } : { width: 14, height: 14 }}
        />
      ))}
      <span className="ml-1 font-bold text-muted">{value.toFixed(1)}</span>
    </span>
  );
}

// Helper: merge video/voice/text into "线上咨询" and show one combined price
function getDisplayServices(p: Psychologist) {
  const services: { type: string; label: string; price?: number }[] = [];
  const hasOnline = p.serviceTypes.some((s) =>
    s.includes("视频") || s.includes("语音") || s.includes("图文"),
  );
  if (hasOnline) {
    services.push({ type: "online", label: "线上咨询", price: p.onlinePrice ?? p.price });
  }
  if (p.serviceTypes.some((s) => s.includes("线下")) || p.offlinePrice) {
    services.push({ type: "offline", label: "线下面询", price: p.offlinePrice });
  }
  if (services.length === 0) {
    services.push({ type: "default", label: "咨询", price: p.price });
  }
  return services;
}

export function PsychologistListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Filters
  const [searchKeyword, setSearchKeyword] = useState(searchParams.get("keyword") ?? "");
  const [gender, setGender] = useState<string>("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");

  // View & Sort
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortBy, setSortBy] = useState<SortBy>("default");

  // Data
  const [psychologists, setPsychologists] = useState<Psychologist[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = viewMode === "grid" ? 8 : 10;

  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const fetchList = useCallback(
    async (p: number) => {
      setLoading(true);
      try {
        const query: Record<string, string | number> = { page: p, size: pageSize };
        if (searchKeyword) query.keyword = searchKeyword;
        if (gender) query.gender = gender;
        if (priceMin) query.priceMin = priceMin;
        if (priceMax) query.priceMax = priceMax;
        if (ratingFilter) query.rating = ratingFilter;
        if (sortBy !== "default") query.sortBy = sortBy;
        const result = await api.psychologist.list(query);
        setPsychologists(result.records);
        setTotal(result.total);
      } catch {
        toast.error("加载咨询师列表失败");
      } finally {
        setLoading(false);
      }
    },
    [pageSize, searchKeyword, gender, priceMin, priceMax, ratingFilter, sortBy],
  );

  useEffect(() => {
    fetchList(page);
  }, [page, viewMode, fetchList]);

  // Debounced search
  const handleSearchChange = (value: string) => {
    setSearchKeyword(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      fetchList(1);
    }, 500);
  };

  const handleReset = () => {
    setSearchKeyword("");
    setGender("");
    setPriceMin("");
    setPriceMax("");
    setRatingFilter("");
    setSortBy("default");
    setPage(1);
  };

  const handleToggleFavorite = async (e: React.MouseEvent, p: Psychologist) => {
    e.preventDefault();
    e.stopPropagation();
    const wasFavorite = p.isFavorite;
    setPsychologists((prev) =>
      prev.map((item) =>
        item.id === p.id ? { ...item, isFavorite: !item.isFavorite } : item,
      ),
    );
    try {
      await api.psychologist.favorite(p.id);
      toast.success(wasFavorite ? "已取消收藏" : "已收藏");
    } catch {
      setPsychologists((prevList) =>
        prevList.map((item) =>
          item.id === p.id ? { ...item, isFavorite: wasFavorite } : item,
        ),
      );
      toast.error("操作失败，请重试");
    }
  };

  const handleBookingClick = (e: React.MouseEvent, p: Psychologist) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/consultation/psychologist/${p.id}`);
  };

  const totalPages = Math.ceil(total / pageSize);

  const renderPsychologistCard = (p: Psychologist) => {
    const services = getDisplayServices(p);

    return (
      <Card className="group relative flex h-full flex-col p-5 transition-all duration-300 hover:-translate-y-1">
        {/* Favorite button */}
        <button
          type="button"
          onClick={(e) => handleToggleFavorite(e, p)}
          className="absolute right-3 top-3 z-10 rounded-full p-1.5 transition-colors hover:bg-purple/10"
          title={p.isFavorite ? "取消收藏" : "收藏"}
        >
          <Heart className={`size-4 ${p.isFavorite ? "fill-yellow text-yellow" : "text-muted/60"}`} />
        </button>

        <div className="mb-4 flex items-start gap-4">
          {/* Avatar + online status */}
          <div className="relative shrink-0">
            <div
              className="flex size-16 items-center justify-center rounded-full"
              style={{
                background: "rgba(201, 168, 255, 0.25)",
                boxShadow: "0 0 0 3px rgba(201, 168, 255, 0.35)",
              }}
            >
              {p.avatar ? (
                <img src={p.avatar} alt={p.name} className="size-16 rounded-full object-cover" />
              ) : (
                <span className="text-2xl font-black text-purple">{p.name[0]}</span>
              )}
            </div>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
              <span className={`inline-block rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                p.availableToday ? "bg-mint text-[var(--on-accent)]" : "bg-purple/15 text-muted"
              }`}>
                {p.availableToday ? "在线" : "离线"}
              </span>
            </div>
          </div>

          {/* Name + info */}
          <div className="min-w-0 flex-1">
            <h3 className="font-black text-ink">{p.name}</h3>
            <p className="text-xs font-bold text-muted">{p.title}</p>
            <div className="mt-1">
              <RatingStars value={p.rating} />
            </div>
          </div>
        </div>

        {/* Info: City, Certifications, Experience */}
        <div className="mb-4 flex-1 space-y-1.5 text-xs font-bold text-muted">
          {p.city && (
            <div className="flex items-center gap-1">
              <MapPin className="size-3 shrink-0 text-blue" />
              <span>{p.city}</span>
            </div>
          )}
          {p.fields.length > 0 && (
            <div className="flex items-center gap-1">
              <Medal className="size-3 shrink-0 text-yellow" />
              <span className="line-clamp-1">{p.fields.slice(0, 3).join("、")}</span>
            </div>
          )}
          {p.yearsExperience != null && p.yearsExperience > 0 && (
            <div className="flex items-center gap-1">
              <Clock className="size-3 shrink-0 text-blue" />
              <span>{p.yearsExperience} 年咨询经验</span>
            </div>
          )}
          {!p.city && p.fields.length === 0 && !p.yearsExperience && (
            <span>{p.intro.slice(0, 60)}{p.intro.length > 60 ? "..." : ""}</span>
          )}
        </div>

        {/* Services + Price */}
        <div className="mb-3 border-t border-[rgba(201,168,255,0.3)] pt-3">
          {services.map((s) => (
            <div key={s.type} className="flex items-center justify-between text-sm">
              <span className="text-muted">{s.label}</span>
              <span className="font-black text-purple">
                ¥{s.price?.toFixed(0) ?? "0"}/次
              </span>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Button variant="quiet" size="sm" onClick={(e) => handleToggleFavorite(e, p)}>
            <Heart className={`mr-1 size-3 ${p.isFavorite ? "fill-yellow text-yellow" : ""}`} />
            {p.isFavorite ? "已收藏" : "收藏"}
          </Button>
          <Button tone="purple" size="sm" onClick={(e) => handleBookingClick(e, p)}>
            立即预约
          </Button>
        </div>
      </Card>
    );
  };

  const renderListViewItem = (p: Psychologist) => {
    const services = getDisplayServices(p);

    return (
      <Card className="group relative flex flex-col gap-3 p-3 transition-all duration-300 hover:-translate-y-0.5 sm:flex-row sm:gap-5 sm:p-4">
        <div className="flex items-start gap-3 sm:contents">
          <button
            type="button"
            onClick={(e) => handleToggleFavorite(e, p)}
            className="absolute right-3 top-3 z-10 rounded-full p-1.5 transition-colors hover:bg-purple/10"
          >
            <Heart className={`size-4 ${p.isFavorite ? "fill-yellow text-yellow" : "text-muted/60"}`} />
          </button>

          <div className="flex shrink-0 flex-col items-center gap-1">
            <div
              className="flex size-14 items-center justify-center rounded-full sm:size-16"
              style={{
                background: "rgba(201, 168, 255, 0.25)",
                boxShadow: "0 0 0 3px rgba(201, 168, 255, 0.35)",
              }}
            >
              {p.avatar ? (
                <img src={p.avatar} alt={p.name} className="size-14 rounded-full object-cover sm:size-16" />
              ) : (
                <span className="text-xl font-black text-purple sm:text-2xl">{p.name[0]}</span>
              )}
            </div>
            <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
              p.availableToday ? "bg-mint text-[var(--on-accent)]" : "bg-purple/15 text-muted"
            }`}>
              {p.availableToday ? "在线" : "离线"}
            </span>
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Link href={`/consultation/psychologist/${p.id}`} className="font-black text-ink hover:text-purple">
              {p.name}
            </Link>
            <span className="text-xs font-bold text-muted">{p.title}</span>
          </div>
          <div className="mt-1"><RatingStars value={p.rating} /></div>
          <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-xs font-bold text-muted/70">
            {p.city && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3 shrink-0" />{p.city}
              </span>
            )}
            {p.fields.length > 0 && (
              <span className="inline-flex items-center gap-1">
                <Medal className="size-3 shrink-0 text-yellow" />
                {p.fields.slice(0, 3).join("、")}
              </span>
            )}
            {p.yearsExperience != null && p.yearsExperience > 0 && (
              <span className="inline-flex items-center gap-1">
                <Clock className="size-3 shrink-0" />
                {p.yearsExperience} 年经验
              </span>
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-row items-center justify-between border-t border-[rgba(201,168,255,0.3)] pt-3 sm:flex-col sm:items-end sm:justify-between sm:border-t-0 sm:pt-0">
          <div className="text-right">
            {services.map((s) => (
              <div key={s.type} className="text-sm">
                <span className="text-muted">{s.label}</span>
                <span className="ml-2 font-black text-purple">¥{s.price?.toFixed(0) ?? "0"}</span>
              </div>
            ))}
          </div>
          <Button tone="purple" size="sm" onClick={(e) => handleBookingClick(e, p)}>
            立即预约
          </Button>
        </div>
      </Card>
    );
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:py-12">
      <h1 className="mb-2 text-2xl font-black text-ink">预约咨询心理师</h1>
      <p className="mb-8 text-muted">找到最适合您的心理咨询师</p>

      {/* Filter Toolbar */}
      <Card className="mb-6 p-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative w-full sm:w-56">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="搜索心理师姓名或地址..."
              className="cushion-field h-9 w-full rounded-control bg-surface pl-10 pr-4 text-sm font-bold text-ink placeholder:text-muted focus-visible:cushion-field-focus focus-visible:outline-none"
            />
          </div>

          {/* Gender filter */}
          <select
            value={gender}
            onChange={(e) => { setGender(e.target.value); setPage(1); }}
            className="cushion-field h-9 rounded-control bg-surface px-3 text-sm font-bold text-ink"
          >
            <option value="">性别</option>
            <option value="1">男咨询师</option>
            <option value="2">女咨询师</option>
          </select>

          {/* Rating filter */}
          <select
            value={ratingFilter}
            onChange={(e) => { setRatingFilter(e.target.value); setPage(1); }}
            className="cushion-field h-9 rounded-control bg-surface px-3 text-sm font-bold text-ink"
          >
            <option value="">评分</option>
            <option value="4.5">&gt;4.5</option>
            <option value="4.0">&gt;4.0</option>
            <option value="3.5">&gt;3.5</option>
            <option value="3.0">&gt;3.0</option>
          </select>

          {/* Price range */}
          <div className="flex items-center gap-1 text-sm">
            <input
              type="number"
              value={priceMin}
              onChange={(e) => setPriceMin(e.target.value)}
              placeholder="最低价"
              className="cushion-field h-9 w-20 rounded-control bg-surface px-2 text-sm font-bold text-ink placeholder:text-muted"
            />
            <span className="text-muted">-</span>
            <input
              type="number"
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
              placeholder="最高价"
              className="cushion-field h-9 w-20 rounded-control bg-surface px-2 text-sm font-bold text-ink placeholder:text-muted"
            />
          </div>

          {/* Reset */}
          <Button variant="quiet" size="sm" onClick={handleReset}>
            <RotateCcw className="mr-1 size-3" />
            重置
          </Button>

          {/* View toggle */}
          <div className="ml-auto flex items-center rounded-control bg-purple/10 p-0.5">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`rounded-md p-1.5 transition-colors ${
                viewMode === "grid" ? "bg-purple/30 text-ink" : "text-muted hover:text-ink"
              }`}
            >
              <LayoutGrid className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`rounded-md p-1.5 transition-colors ${
                viewMode === "list" ? "bg-purple/30 text-ink" : "text-muted hover:text-ink"
              }`}
            >
              <List className="size-4" />
            </button>
          </div>
        </div>

        {/* Sort row */}
        <div className="mt-3 flex items-center gap-2 border-t border-[rgba(201,168,255,0.3)] pt-3">
          <span className="text-xs font-bold text-muted">排序：</span>
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { setSortBy(opt.value); setPage(1); }}
              className={`rounded-full px-3 py-1 text-xs font-bold transition-colors ${
                sortBy === opt.value
                  ? "bg-purple/20 text-purple"
                  : "text-muted hover:text-ink"
              }`}
            >
              {opt.label}
            </button>
          ))}
          <span className="ml-auto text-xs font-bold text-muted">共 {total} 位</span>
        </div>
      </Card>

      {/* Content */}
      {loading ? (
        <div className={viewMode === "grid" ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-4" : "space-y-3"}>
          {Array.from({ length: viewMode === "grid" ? 8 : 4 }).map((_, i) => (
            <Card key={i} className="p-5">
              <Skeleton className="mb-3 size-16 rounded-full" />
              <Skeleton className="mb-2 h-5 w-32" />
              <Skeleton className="mb-1 h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </Card>
          ))}
        </div>
      ) : psychologists.length === 0 ? (
        <div className="py-20 text-center text-muted">
          <Search className="mx-auto mb-4 size-12 opacity-30" />
          <p>暂无符合条件的心理咨询师</p>
        </div>
      ) : (
        <>
          {viewMode === "grid" ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {psychologists.map((p) => (
                <Link key={p.id} href={`/consultation/psychologist/${p.id}`}>
                  {renderPsychologistCard(p)}
                </Link>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {psychologists.map((p) => (
                <div key={p.id}>{renderListViewItem(p)}</div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <Button
                variant="quiet"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                上一页
              </Button>
              {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setPage(pageNum)}
                    className={`size-8 rounded-control text-sm font-bold transition-colors ${
                      page === pageNum
                        ? "bg-purple/30 text-ink"
                        : "text-muted hover:bg-purple/10 hover:text-ink"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              {totalPages > 5 && <span className="text-muted">...</span>}
              <Button
                variant="quiet"
                size="sm"
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
