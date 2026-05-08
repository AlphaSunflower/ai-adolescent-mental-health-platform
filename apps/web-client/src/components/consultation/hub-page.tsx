"use client";

import Link from "next/link";
import { Calendar, Users, Stethoscope, ArrowRight } from "lucide-react";

export function ConsultationHubPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:py-12">
      <h1 className="cosmic-page-title mb-4 text-2xl">心理咨询</h1>
      <p className="mb-10 text-cosmic-muted">专业的心理健康服务，为你的成长保驾护航</p>

      {/* Service Entry Points */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
    </div>
  );
}
