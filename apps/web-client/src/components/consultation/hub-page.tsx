"use client";

import Link from "next/link";
import { Calendar, Users, Stethoscope, MessageCircle, ArrowRight, Star, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import type { Psychologist } from "@/lib/types";

export function ConsultationHubPage() {
  const [featured, setFeatured] = useState<Psychologist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.psychologist.list({ page: "1", size: "4" })
      .then((r) => setFeatured(r.records))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:py-12">
      <h1 className="cosmic-page-title mb-4 text-2xl">心理咨询</h1>
      <p className="mb-10 text-cosmic-muted">专业的心理健康服务，为你的成长保驾护航</p>

      {/* Service Entry Points */}
      <div className="mb-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/consultation/psychologist">
          <div className="cosmic-card group cursor-pointer p-6 transition-all duration-300 hover:-translate-y-1">
            <div className="mb-4 inline-flex rounded-xl bg-gradient-to-br from-cyan-500/20 to-teal-500/20 p-3">
              <Users className="size-6 text-cyan-400" />
            </div>
            <h3 className="mb-1 font-semibold text-white">心理咨询师</h3>
            <p className="mb-4 text-sm text-cosmic-muted">认证心理咨询师，在线/到院可选</p>
            <span className="inline-flex items-center gap-1 text-sm text-cosmic-sky group-hover:text-cosmic-nav-hover">
              查看咨询师 <ArrowRight className="size-3 transition-transform group-hover:translate-x-1" />
            </span>
          </div>
        </Link>

        <Link href="/consultation/doctor">
          <div className="cosmic-card group cursor-pointer p-6 transition-all duration-300 hover:-translate-y-1">
            <div className="mb-4 inline-flex rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 p-3">
              <Stethoscope className="size-6 text-blue-400" />
            </div>
            <h3 className="mb-1 font-semibold text-white">医生问诊</h3>
            <p className="mb-4 text-sm text-cosmic-muted">精神科医生在线问诊，专业诊疗</p>
            <span className="inline-flex items-center gap-1 text-sm text-cosmic-sky group-hover:text-cosmic-nav-hover">
              了解详情 <ArrowRight className="size-3 transition-transform group-hover:translate-x-1" />
            </span>
          </div>
        </Link>

        <Link href="/me/psychology">
          <div className="cosmic-card group cursor-pointer p-6 transition-all duration-300 hover:-translate-y-1">
            <div className="mb-4 inline-flex rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 p-3">
              <Calendar className="size-6 text-purple-400" />
            </div>
            <h3 className="mb-1 font-semibold text-white">我的咨询</h3>
            <p className="mb-4 text-sm text-cosmic-muted">查看咨询记录和预约管理</p>
            <span className="inline-flex items-center gap-1 text-sm text-cosmic-sky group-hover:text-cosmic-nav-hover">
              查看记录 <ArrowRight className="size-3 transition-transform group-hover:translate-x-1" />
            </span>
          </div>
        </Link>
      </div>

      {/* Featured Psychologists */}
      <section>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">推荐咨询师</h2>
          <Link href="/consultation/psychologist" className="text-sm text-cosmic-sky hover:underline">
            查看全部
          </Link>
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="cosmic-card p-4">
                <Skeleton className="mb-3 size-16 rounded-full" />
                <Skeleton className="mb-2 h-5 w-24" />
                <Skeleton className="mb-1 h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((p) => (
              <Link key={p.id} href={`/consultation/psychologist/${p.id}`}>
                <div className="cosmic-card group cursor-pointer p-4 text-center transition-all duration-300 hover:-translate-y-1">
                  <div className="mx-auto mb-3 size-16 rounded-full bg-cosmic-blue/20 flex items-center justify-center">
                    {p.avatar ? (
                      <img src={p.avatar} alt={p.name} className="size-16 rounded-full object-cover" />
                    ) : (
                      <span className="text-xl font-bold text-cosmic-sky">{p.name[0]}</span>
                    )}
                  </div>
                  <h3 className="font-semibold text-white">{p.name}</h3>
                  <p className="text-xs text-cosmic-muted">{p.title}</p>
                  <div className="mt-2 flex items-center justify-center gap-1 text-xs text-cosmic-gold">
                    <Star className="size-3 fill-current" />
                    {p.rating}
                  </div>
                  <div className="mt-1 flex items-center justify-center gap-1 text-xs text-cosmic-dim">
                    <MapPin className="size-3" />
                    {p.city}
                  </div>
                  {p.availableToday && (
                    <Badge variant="gold" className="mt-2 text-xs">今日可约</Badge>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
