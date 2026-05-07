"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Star, MapPin, Clock, Phone, Calendar, Users, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import type { Psychologist, PatientContact } from "@/lib/types";

export function PsychologistDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [psychologist, setPsychologist] = useState<Psychologist | null>(null);
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState<PatientContact[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await api.psychologist.list({ page: 1, size: 100 });
        const found = result.records.find((p) => p.id === Number(id));
        setPsychologist(found ?? null);
      } catch {
        toast.error("加载咨询师信息失败");
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    api.patient.list()
      .then(setPatients)
      .catch(() => {});
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 md:py-12">
        <Skeleton className="mb-4 h-5 w-24" />
        <div className="cosmic-card p-6 md:p-8">
          <Skeleton className="mb-4 size-24 rounded-full" />
          <Skeleton className="mb-2 h-8 w-48" />
          <Skeleton className="mb-1 h-4 w-3/4" />
          <Skeleton className="mb-1 h-4 w-1/2" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    );
  }

  if (!psychologist) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center">
        <p className="text-lg text-cosmic-muted">咨询师不存在</p>
        <Link href="/consultation/psychologist" className="mt-4 inline-block text-cosmic-sky hover:underline">
          返回列表
        </Link>
      </div>
    );
  }

  const p = psychologist;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:py-12">
      <Link
        href="/consultation/psychologist"
        className="mb-6 inline-flex items-center gap-1 text-sm text-cosmic-muted hover:text-cosmic-sky transition-colors"
      >
        <ArrowLeft className="size-4" />
        返回列表
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Info */}
        <div className="lg:col-span-2">
          <div className="cosmic-card p-6 md:p-8">
            <div className="mb-6 flex items-start gap-5">
              <div className="size-20 shrink-0 rounded-full bg-cosmic-blue/20 flex items-center justify-center">
                {p.avatar ? (
                  <img src={p.avatar} alt={p.name} className="size-20 rounded-full object-cover" />
                ) : (
                  <span className="text-3xl font-bold text-cosmic-sky">{p.name[0]}</span>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{p.name}</h1>
                <p className="text-cosmic-muted">{p.title}</p>
                <div className="mt-2 flex items-center gap-4 text-sm">
                  <span className="inline-flex items-center gap-1 text-cosmic-gold">
                    <Star className="size-4 fill-current" /> {p.rating}
                  </span>
                  <span className="inline-flex items-center gap-1 text-cosmic-dim">
                    <MapPin className="size-4" /> {p.city}
                  </span>
                </div>
              </div>
            </div>

            <div className="mb-6 flex flex-wrap gap-2">
              {p.fields.map((f) => (
                <span key={f} className="cosmic-tag">{f}</span>
              ))}
            </div>

            <div className="mb-6 flex flex-wrap gap-3 text-sm">
              {p.serviceTypes.map((s) => (
                <Badge key={s} variant="secondary">{s}</Badge>
              ))}
              {p.availableToday && <Badge variant="gold">今日可约</Badge>}
            </div>

            <div className="border-t border-white/10 pt-6">
              <h2 className="mb-3 font-semibold text-white">个人简介</h2>
              <p className="leading-relaxed text-cosmic-muted">{p.intro}</p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="cosmic-card p-5">
            <h3 className="mb-4 font-semibold text-white">咨询方式</h3>
            <div className="space-y-3">
              {p.onlinePrice && (
                <div className="flex items-center justify-between text-sm">
                  <span className="inline-flex items-center gap-2 text-cosmic-muted">
                    <MessageCircle className="size-4 text-cosmic-sky" />
                    线上咨询
                  </span>
                  <span className="font-semibold text-cosmic-gold">¥{p.onlinePrice}/次</span>
                </div>
              )}
              {p.offlinePrice && (
                <div className="flex items-center justify-between text-sm">
                  <span className="inline-flex items-center gap-2 text-cosmic-muted">
                    <Users className="size-4 text-cosmic-sky" />
                    到院咨询
                  </span>
                  <span className="font-semibold text-cosmic-gold">¥{p.offlinePrice}/次</span>
                </div>
              )}
              {!p.onlinePrice && !p.offlinePrice && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-cosmic-muted">咨询费用</span>
                  <span className="font-semibold text-cosmic-gold">¥{p.price}/次</span>
                </div>
              )}
            </div>

            <Button variant="primary" className="mt-5 w-full" onClick={() => toast.info("预约功能开发中")}>
              <Calendar className="mr-1 size-4" />
              立即预约
            </Button>
          </div>

          {patients.length > 0 && (
            <div className="cosmic-card p-5">
              <h3 className="mb-3 font-semibold text-white">就诊人</h3>
              <div className="space-y-2">
                {patients.map((pt) => (
                  <div key={pt.id} className="text-sm text-cosmic-muted flex justify-between">
                    <span>{pt.name}</span>
                    <span className="text-cosmic-dim">{pt.relation}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
