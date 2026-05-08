"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, Heart, Star, ShoppingBag, Calendar, ArrowRight, Pencil } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import type { UserProfile, Appointment } from "@/lib/types";

export function MePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentAppointments, setRecentAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const p = await api.user.getUserInfo();
        setProfile(p);
        const appts = await api.appointment.my();
        setRecentAppointments(appts.records.slice(0, 3));
      } catch {
        // keep defaults
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const displayName = profile?.nickname || profile?.username || "用户";

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">欢迎回来，{displayName}</h1>
      <p className="mt-1 text-sm text-cosmic-muted">
        {profile?.signature || "关注你的心理健康，从这里开始"}
      </p>

      {/* Quick action cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Link href="/me/publish">
          <div className="cosmic-card group cursor-pointer p-4 transition-all hover:-translate-y-0.5">
            <div className="mb-3 inline-flex rounded-lg bg-cosmic-sky/20 p-2">
              <Pencil className="size-5 text-cosmic-sky" />
            </div>
            <div className="text-lg font-bold text-white">发布文章</div>
            <div className="mt-1 flex items-center gap-1 text-xs text-cosmic-dim group-hover:text-cosmic-sky">
              写文章 <ArrowRight className="size-3 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </Link>

        <Link href="/me/articles">
          <div className="cosmic-card group cursor-pointer p-4 transition-all hover:-translate-y-0.5">
            <div className="mb-3 inline-flex rounded-lg bg-purple-500/20 p-2">
              <FileText className="size-5 text-purple-400" />
            </div>
            <div className="text-lg font-bold text-white">我的发布</div>
            <div className="mt-1 flex items-center gap-1 text-xs text-cosmic-dim group-hover:text-cosmic-sky">
              管理文章 <ArrowRight className="size-3 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </Link>

        <Link href="/me/favorites">
          <div className="cosmic-card group cursor-pointer p-4 transition-all hover:-translate-y-0.5">
            <div className="mb-3 inline-flex rounded-lg bg-amber-500/20 p-2">
              <Star className="size-5 text-amber-400" />
            </div>
            <div className="text-lg font-bold text-white">我的收藏</div>
            <div className="mt-1 flex items-center gap-1 text-xs text-cosmic-dim group-hover:text-cosmic-sky">
              查看收藏 <ArrowRight className="size-3 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </Link>

        <Link href="/me/likes">
          <div className="cosmic-card group cursor-pointer p-4 transition-all hover:-translate-y-0.5">
            <div className="mb-3 inline-flex rounded-lg bg-pink-500/20 p-2">
              <Heart className="size-5 text-pink-400" />
            </div>
            <div className="text-lg font-bold text-white">我的点赞</div>
            <div className="mt-1 flex items-center gap-1 text-xs text-cosmic-dim group-hover:text-cosmic-sky">
              查看点赞 <ArrowRight className="size-3 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </Link>

        <Link href="/me/orders">
          <div className="cosmic-card group cursor-pointer p-4 transition-all hover:-translate-y-0.5">
            <div className="mb-3 inline-flex rounded-lg bg-green-500/20 p-2">
              <ShoppingBag className="size-5 text-green-400" />
            </div>
            <div className="text-lg font-bold text-white">我的订单</div>
            <div className="mt-1 flex items-center gap-1 text-xs text-cosmic-dim group-hover:text-cosmic-sky">
              查看订单 <ArrowRight className="size-3 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </Link>
      </div>

      {/* Recent appointments */}
      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
            <Calendar className="size-5 text-cosmic-sky" />
            近期预约
          </h2>
          <Link href="/me/psychology">
            <Button variant="ghost" size="xs">
              查看全部 <ArrowRight className="ml-1 size-3" />
            </Button>
          </Link>
        </div>

        {recentAppointments.length === 0 ? (
          <div className="cosmic-card p-8 text-center">
            <p className="mb-4 text-sm text-cosmic-muted">暂无预约记录</p>
            <Link href="/consultation/psychologist">
              <Button variant="primary" size="sm">去预约咨询师</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentAppointments.map((a) => (
              <div key={a.id} className="cosmic-card flex items-center justify-between p-4">
                <div>
                  <div className="font-medium text-white">{a.psychologistName}</div>
                  <div className="mt-0.5 text-xs text-cosmic-dim">
                    {a.date} {a.time} · {a.type}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-cosmic-gold">¥{a.fee}</span>
                  <span className="cosmic-tag text-xs">{a.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
