"use client";

import Link from "next/link";
import { Calendar, Users, ArrowRight } from "lucide-react";
import { Card } from "@/components/pouf/Card";

function ServiceBlob({ blob, icon: Icon }: { blob: string; icon: typeof Users }) {
  return (
    <span className={`mb-4 inline-grid rounded-pill p-3 ${blob} cushion-blob`}>
      <Icon className="size-6 text-ink" />
    </span>
  );
}

export function ConsultationHubPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:py-12">
      <h1 className="mb-4 text-2xl font-black text-ink">心理咨询</h1>
      <p className="mb-10 text-muted">专业的心理健康服务，为你的成长保驾护航</p>

      {/* Service Entry Points */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/consultation/psychologist">
          <Card className="group h-full cursor-pointer p-6 transition-all duration-300 hover:-translate-y-1">
            <ServiceBlob blob="bg-blue tone-blue" icon={Users} />
            <h3 className="mb-1 font-black text-ink">心理咨询师</h3>
            <p className="mb-4 text-sm font-bold text-muted">认证心理咨询师，在线/到院可选</p>
            <span className="inline-flex items-center gap-1 text-sm font-bold text-purple group-hover:text-purple">
              查看咨询师 <ArrowRight className="size-3 transition-transform group-hover:translate-x-1" />
            </span>
          </Card>
        </Link>

        <Link href="/me/psychology">
          <Card className="group h-full cursor-pointer p-6 transition-all duration-300 hover:-translate-y-1">
            <ServiceBlob blob="bg-purple tone-purple" icon={Calendar} />
            <h3 className="mb-1 font-black text-ink">我的咨询</h3>
            <p className="mb-4 text-sm font-bold text-muted">查看咨询记录和预约管理</p>
            <span className="inline-flex items-center gap-1 text-sm font-bold text-purple group-hover:text-purple">
              查看记录 <ArrowRight className="size-3 transition-transform group-hover:translate-x-1" />
            </span>
          </Card>
        </Link>
      </div>
    </div>
  );
}
