import Link from "next/link";
import { Stethoscope, ArrowLeft } from "lucide-react";

export default function DoctorConsultationRoute() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:py-12">
      <Link
        href="/consultation"
        className="mb-6 inline-flex items-center gap-1 text-sm text-cosmic-muted hover:text-cosmic-sky transition-colors"
      >
        <ArrowLeft className="size-4" />
        返回咨询中心
      </Link>
      <div className="cosmic-card p-8 text-center">
        <Stethoscope className="mx-auto mb-4 size-16 text-blue-400 opacity-40" />
        <h1 className="mb-2 text-2xl font-bold text-white">医生问诊</h1>
        <p className="text-cosmic-muted">精神科医生在线问诊功能正在建设中，敬请期待。</p>
      </div>
    </div>
  );
}
