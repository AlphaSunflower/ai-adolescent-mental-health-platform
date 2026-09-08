"use client";

import Link from "next/link";
import { ArrowLeft, Users, Star, Shield, Award, ChevronRight } from "lucide-react";
import { Button } from "@/components/pouf/Button";
import { Card } from "@/components/pouf/Card";

const BENEFITS = [
  { icon: Users, title: "专业平台", desc: "加入专业的心理健康服务平台，接触更多需要帮助的青少年" },
  { icon: Star, title: "品牌认可", desc: "获得心愈智联平台的官方认证和推荐，提升个人品牌" },
  { icon: Shield, title: "权益保障", desc: "完善的预约和管理系统，保障咨询师的合法权益" },
  { icon: Award, title: "持续成长", desc: "定期的专业培训和督导，助力咨询师持续提升" },
];

const REQUIREMENTS = [
  "持有国家认可的心理咨询相关资质证书",
  "具备 2 年以上心理咨询实践经验",
  "认同心愈智联的服务理念和价值观",
  "通过平台的资质审核和面试评估",
];

export function ApplyIntroPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:py-12">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted hover:text-purple transition-colors"
      >
        <ArrowLeft className="size-4" />
        返回首页
      </Link>

      <div className="text-center mb-12">
        <h1 className="text-3xl font-black text-ink md:text-4xl">成为心愈智联咨询师</h1>
        <p className="mt-4 text-muted">加入我们，用专业守护青少年的心理健康</p>
      </div>

      {/* Benefits */}
      <div className="mb-12 grid gap-4 sm:grid-cols-2">
        {BENEFITS.map((b) => (
          <Card key={b.title} className="p-5">
            <div className="mb-3 inline-flex rounded-control bg-purple/20 p-2">
              <b.icon className="size-5 text-purple" />
            </div>
            <h3 className="mb-1 font-black text-ink">{b.title}</h3>
            <p className="text-sm font-bold text-muted">{b.desc}</p>
          </Card>
        ))}
      </div>

      {/* Requirements */}
      <Card className="mb-8 p-6">
        <h2 className="mb-4 text-lg font-black text-ink">申请条件</h2>
        <ul className="space-y-2">
          {REQUIREMENTS.map((r, i) => (
            <li key={i} className="flex items-start gap-2 text-sm font-bold text-muted">
              <span className="mt-1 size-1.5 shrink-0 rounded-full bg-yellow" />
              {r}
            </li>
          ))}
        </ul>
      </Card>

      {/* CTA */}
      <div className="text-center">
        <Link href="/apply/basic">
          <Button tone="purple" size="lg">
            开始申请
            <ChevronRight className="size-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
