"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Star, MapPin, Clock, Search, RotateCcw, LayoutGrid, List, Heart,
  Medal, Phone, MessageCircle, Video, Users, ChevronDown, Calendar, X
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
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
          className={i < stars ? "text-cosmic-gold fill-current" : "text-cosmic-dim"}
          style={size === "md" ? { width: 18, height: 18 } : { width: 14, height: 14 }}
        />
      ))}
      <span className="ml-1 text-cosmic-muted">{value.toFixed(1)}</span>
    </span>
  );
}

// Helper: merge video/voice/text into "线上咨询" and show one combined price
function getDisplayServices(p: Psychologist) {
  const services: { type: string; label: string; price?: number }[] = [];
  const onlineTypes = ["text", "video", "voice"];
  const hasOnline = p.serviceTypes.some((s) => onlineTypes.includes(s));
  if (hasOnline) {
    services.push({ type: "online", label: "线上咨询", price: p.onlinePrice ?? p.price });
  }
  if (p.serviceTypes.includes("offline") || p.offlinePrice) {
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

  // Booking dialog
  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedForBooking, setSelectedForBooking] = useState<Psychologist | null>(null);

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
    // Optimistic toggle — API not available yet, just toggle UI
    setPsychologists((prev) =>
      prev.map((item) =>
        item.id === p.id ? { ...item, isFavorite: !item.isFavorite } : item,
      ),
    );
    toast.success(p.isFavorite ? "已取消收藏" : "已收藏");
  };

  const handleBookingClick = (e: React.MouseEvent, p: Psychologist) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedForBooking(p);
    setBookingOpen(true);
  };

  const handleCreateAppointment = async () => {
    if (!selectedForBooking) return;
    try {
      await api.appointment.create({
        psychologistId: selectedForBooking.id,
        serviceType: getDisplayServices(selectedForBooking)[0]?.type ?? "online",
      });
      toast.success("预约成功");
      setBookingOpen(false);
    } catch {
      toast.error("预约失败，请重试");
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  const renderPsychologistCard = (p: Psychologist) => {
    const services = getDisplayServices(p);

    return (
      <div className="cosmic-card group flex h-full flex-col p-5 transition-all duration-300 hover:-translate-y-1 relative">
        {/* Favorite button */}
        <button
          type="button"
          onClick={(e) => handleToggleFavorite(e, p)}
          className="absolute right-3 top-3 z-10 rounded-full p-1.5 transition-colors hover:bg-white/10"
          title={p.isFavorite ? "取消收藏" : "收藏"}
        >
          <Heart className={`size-4 ${p.isFavorite ? "fill-cosmic-gold text-cosmic-gold" : "text-cosmic-dim"}`} />
        </button>

        <div className="mb-4 flex items-start gap-4">
          {/* Avatar + online status */}
          <div className="relative shrink-0">
            <div
              className="size-16 rounded-full flex items-center justify-center"
              style={{
                background: "rgba(100, 149, 237, 0.2)",
                boxShadow: "0 0 0 3px rgba(255, 215, 0, 0.3)",
              }}
            >
              {p.avatar ? (
                <img src={p.avatar} alt={p.name} className="size-16 rounded-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-cosmic-sky">{p.name[0]}</span>
              )}
            </div>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
              <span className={`inline-block rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                p.availableToday ? "bg-green-500/80 text-white" : "bg-gray-500/60 text-gray-300"
              }`}>
                {p.availableToday ? "在线" : "离线"}
              </span>
            </div>
          </div>

          {/* Name + info */}
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-white">{p.name}</h3>
            <p className="text-xs text-cosmic-muted">{p.title}</p>
            <div className="mt-1">
              <RatingStars value={p.rating} />
            </div>
          </div>
        </div>

        {/* Fields */}
        {p.fields.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1">
            {p.fields.slice(0, 3).map((f) => (
              <span key={f} className="cosmic-tag text-xs">{f}</span>
            ))}
            {p.fields.length > 3 && (
              <span className="text-xs text-cosmic-dim">+{p.fields.length - 3}</span>
            )}
          </div>
        )}

        {/* City */}
        {p.city && (
          <div className="mb-2 inline-flex items-center gap-1 rounded-md bg-purple-500/10 px-2 py-1 text-xs text-cosmic-muted">
            <MapPin className="size-3 text-cosmic-sky" />
            {p.city}
          </div>
        )}

        {/* Intro */}
        <p className="mb-4 line-clamp-2 flex-1 text-sm text-cosmic-muted">{p.intro}</p>

        {/* Services + Price */}
        <div className="mb-3 border-t border-white/10 pt-3">
          {services.map((s) => (
            <div key={s.type} className="flex items-center justify-between text-sm">
              <span className="text-cosmic-muted">{s.label}</span>
              <span className="font-semibold text-cosmic-gold">
                ¥{s.price?.toFixed(0) ?? "0"}/次
              </span>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="xs" onClick={(e) => handleToggleFavorite(e, p)}>
            <Heart className={`mr-1 size-3 ${p.isFavorite ? "fill-cosmic-gold text-cosmic-gold" : ""}`} />
            {p.isFavorite ? "已收藏" : "收藏"}
          </Button>
          <Button variant="primary" size="xs" onClick={(e) => handleBookingClick(e, p)}>
            立即预约
          </Button>
        </div>
      </div>
    );
  };

  const renderListViewItem = (p: Psychologist) => {
    const services = getDisplayServices(p);

    return (
      <div className="cosmic-card group flex gap-5 p-4 transition-all duration-300 hover:-translate-y-0.5 relative">
        <button
          type="button"
          onClick={(e) => handleToggleFavorite(e, p)}
          className="absolute right-3 top-3 z-10 rounded-full p-1.5 transition-colors hover:bg-white/10"
        >
          <Heart className={`size-4 ${p.isFavorite ? "fill-cosmic-gold text-cosmic-gold" : "text-cosmic-dim"}`} />
        </button>

        <div className="flex shrink-0 flex-col items-center gap-1">
          <div
            className="size-16 rounded-full flex items-center justify-center"
            style={{
              background: "rgba(100, 149, 237, 0.2)",
              boxShadow: "0 0 0 3px rgba(255, 215, 0, 0.3)",
            }}
          >
            {p.avatar ? (
              <img src={p.avatar} alt={p.name} className="size-16 rounded-full object-cover" />
            ) : (
              <span className="text-2xl font-bold text-cosmic-sky">{p.name[0]}</span>
            )}
          </div>
          <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${
            p.availableToday ? "bg-green-500/80 text-white" : "bg-gray-500/60 text-gray-300"
          }`}>
            {p.availableToday ? "在线" : "离线"}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Link href={`/consultation/psychologist/${p.id}`} className="font-semibold text-white hover:text-cosmic-nav-hover">
              {p.name}
            </Link>
            <span className="text-xs text-cosmic-muted">{p.title}</span>
          </div>
          <div className="mt-1"><RatingStars value={p.rating} /></div>
          {p.city && (
            <div className="mt-1 inline-flex items-center gap-1 text-xs text-cosmic-dim">
              <MapPin className="size-3" />{p.city}
            </div>
          )}
          {p.fields.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {p.fields.slice(0, 5).map((f) => (
                <span key={f} className="cosmic-tag text-xs">{f}</span>
              ))}
            </div>
          )}
          <p className="mt-2 line-clamp-2 text-sm text-cosmic-muted">{p.intro}</p>
        </div>

        <div className="flex shrink-0 flex-col items-end justify-between">
          <div className="text-right">
            {services.map((s) => (
              <div key={s.type} className="text-sm">
                <span className="text-cosmic-muted">{s.label}</span>
                <span className="ml-2 font-semibold text-cosmic-gold">¥{s.price?.toFixed(0) ?? "0"}</span>
              </div>
            ))}
          </div>
          <Button variant="primary" size="xs" onClick={(e) => handleBookingClick(e, p)}>
            立即预约
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:py-12">
      <h1 className="cosmic-page-title mb-2 text-2xl">预约咨询心理师</h1>
      <p className="mb-8 text-cosmic-muted">找到最适合您的心理咨询师</p>

      {/* Filter Toolbar */}
      <div className="cosmic-card mb-6 p-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative w-full sm:w-56">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-cosmic-dim" />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="搜索心理师姓名或地址..."
              className="cosmic-input h-9 w-full rounded-lg pl-10 pr-4 text-sm"
            />
          </div>

          {/* Gender filter */}
          <select
            value={gender}
            onChange={(e) => { setGender(e.target.value); setPage(1); }}
            className="cosmic-input h-9 rounded-lg bg-white/10 px-3 text-sm text-cosmic-muted"
          >
            <option value="">性别</option>
            <option value="1">男咨询师</option>
            <option value="2">女咨询师</option>
          </select>

          {/* Rating filter */}
          <select
            value={ratingFilter}
            onChange={(e) => { setRatingFilter(e.target.value); setPage(1); }}
            className="cosmic-input h-9 rounded-lg bg-white/10 px-3 text-sm text-cosmic-muted"
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
              className="cosmic-input h-9 w-20 rounded-lg px-2 text-sm"
            />
            <span className="text-cosmic-dim">-</span>
            <input
              type="number"
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
              placeholder="最高价"
              className="cosmic-input h-9 w-20 rounded-lg px-2 text-sm"
            />
          </div>

          {/* Reset */}
          <Button variant="outline" size="xs" onClick={handleReset}>
            <RotateCcw className="mr-1 size-3" />
            重置
          </Button>

          {/* View toggle */}
          <div className="ml-auto flex items-center rounded-lg bg-white/5 p-0.5">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`rounded-md p-1.5 transition-colors ${
                viewMode === "grid" ? "bg-cosmic-blue/30 text-white" : "text-cosmic-dim hover:text-white"
              }`}
            >
              <LayoutGrid className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`rounded-md p-1.5 transition-colors ${
                viewMode === "list" ? "bg-cosmic-blue/30 text-white" : "text-cosmic-dim hover:text-white"
              }`}
            >
              <List className="size-4" />
            </button>
          </div>
        </div>

        {/* Sort row */}
        <div className="mt-3 flex items-center gap-2 border-t border-white/10 pt-3">
          <span className="text-xs text-cosmic-dim">排序：</span>
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { setSortBy(opt.value); setPage(1); }}
              className={`rounded-full px-3 py-1 text-xs transition-colors ${
                sortBy === opt.value
                  ? "bg-cosmic-blue/20 text-cosmic-sky"
                  : "text-cosmic-dim hover:text-white"
              }`}
            >
              {opt.label}
            </button>
          ))}
          <span className="ml-auto text-xs text-cosmic-dim">共 {total} 位</span>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className={viewMode === "grid" ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-4" : "space-y-3"}>
          {Array.from({ length: viewMode === "grid" ? 8 : 4 }).map((_, i) => (
            <div key={i} className="cosmic-card p-5">
              <Skeleton className="mb-3 size-16 rounded-full" />
              <Skeleton className="mb-2 h-5 w-32" />
              <Skeleton className="mb-1 h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      ) : psychologists.length === 0 ? (
        <div className="py-20 text-center text-cosmic-muted">
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
                variant="outline"
                size="xs"
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
                    className={`size-8 rounded-lg text-sm transition-colors ${
                      page === pageNum
                        ? "bg-cosmic-blue/30 text-white"
                        : "text-cosmic-dim hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              {totalPages > 5 && <span className="text-cosmic-dim">...</span>}
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

      {/* Booking Dialog */}
      <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
        <DialogContent className="!max-w-lg">
          <DialogTitle>预约咨询</DialogTitle>
          {selectedForBooking && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-lg bg-white/5 p-3">
                <div className="size-12 rounded-full bg-cosmic-blue/20 flex items-center justify-center">
                  <span className="text-lg font-bold text-cosmic-sky">{selectedForBooking.name[0]}</span>
                </div>
                <div>
                  <p className="font-semibold text-white">{selectedForBooking.name}</p>
                  <p className="text-xs text-cosmic-muted">{selectedForBooking.title}</p>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm text-cosmic-muted">咨询方式</label>
                {getDisplayServices(selectedForBooking).map((s) => (
                  <label key={s.type} className="flex cursor-pointer items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-3 hover:border-cosmic-gold/40">
                    <span className="text-sm text-white">{s.label}</span>
                    <span className="text-sm font-semibold text-cosmic-gold">¥{s.price?.toFixed(0) ?? "0"}</span>
                  </label>
                ))}
              </div>

              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" size="sm">取消</Button>
                </DialogClose>
                <Button variant="primary" size="sm" onClick={handleCreateAppointment}>
                  确认预约
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
