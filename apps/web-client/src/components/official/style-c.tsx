"use client";

/**
 * 风格方案 C「晨间生长」（自创方向：暖调自然风）：
 * 暖米白底、深墨绿主色、暖橙次强调、左对齐编辑式构图。
 * 设计理由：蓝紫是科技与心理咨询两个赛道的同质化默认色；
 * 绿色呼应 logo 心形的青绿主瓣，传递生长与疗愈；深墨绿给家长
 * 专业可信感，暖橙给青少年温暖活力；米白底像画纸，亲和不幼稚。
 * 仅 Hero + 功能介绍两屏，静态无动效。
 */
import Link from "next/link";
import {
  ADMIN_MODULES,
  HERO_BUTTONS,
  HeroIntro,
  NAV_LINKS,
  PARENT_MODULES,
  USER_MODULES,
  type FeatureModule,
} from "./style-data";

function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[#E8E2D4] bg-[#FAF7F0]/90 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
        <a href="#hero" className="flex items-center gap-2.5">
          <img
            src="/logo.png"
            alt="心愈智联 Logo"
            className="h-9 w-auto object-contain"
          />
          <span className="text-[15px] font-bold tracking-tight text-[#1E4D40]">
            心愈智联
          </span>
        </a>
        <div className="flex items-center gap-7">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-[#63705F] transition-colors hover:text-[#1E4D40]"
            >
              {link.label}
            </a>
          ))}
          <Link
            href="/home"
            className="rounded-full bg-[#2E7D64] px-5 py-2 text-sm font-bold text-white transition-colors hover:bg-[#276B56]"
          >
            进入平台
          </Link>
        </div>
      </nav>
    </header>
  );
}

function Hero() {
  return (
    <section id="hero" className="pt-16">
      <div className="mx-auto max-w-5xl px-6 pb-28 pt-28 md:pt-36">
        <div className="max-w-2xl">
          <p className="text-sm font-bold tracking-[0.2em] text-[#2E7D64]">
            青少年心理健康 AI 平台
          </p>
          <h1 className="mt-4 text-5xl font-black leading-[1.15] tracking-tight text-[#1E4D40] md:text-[64px]">
            心愈智联
          </h1>
          <HeroIntro className="mt-8 text-[15px] leading-[1.95] text-[#63705F] [&_strong]:font-bold [&_strong]:text-[#1E4D40]" />
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              href={HERO_BUTTONS.primary.href}
              className="rounded-full bg-[#2E7D64] px-8 py-3.5 text-sm font-bold text-white shadow-[0_8px_24px_rgba(46,125,100,0.28)] transition-colors hover:bg-[#276B56]"
            >
              {HERO_BUTTONS.primary.label}
            </Link>
            <a
              href={HERO_BUTTONS.secondary.href}
              className="rounded-full border-2 border-[#E89B4B] px-8 py-3.5 text-sm font-bold text-[#B96F2A] transition-colors hover:bg-[#FDF3E3]"
            >
              {HERO_BUTTONS.secondary.label}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function ModuleCard({ data, index }: { data: FeatureModule; index: number }) {
  return (
    <article className="rounded-2xl border border-[#E6E0D2] bg-white p-7">
      <div className="flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2E7D64] text-xs font-bold text-white">
          {String(index + 1).padStart(2, "0")}
        </span>
        <h3 className="text-lg font-bold tracking-tight text-[#1E4D40]">
          {data.module}
        </h3>
      </div>
      <p className="mt-3.5 text-sm leading-relaxed text-[#63705F]">{data.tagline}</p>
      <ul className="mt-5 flex flex-wrap gap-2">
        {data.features.map((feature) => (
          <li
            key={feature}
            className="rounded-full bg-[#EDF3EA] px-3 py-1.5 text-xs font-medium text-[#2E7D64]"
          >
            {feature}
          </li>
        ))}
      </ul>
    </article>
  );
}

function RowCard({ title, modules }: { title: string; modules: string[] }) {
  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-[#E6E0D2] bg-[#F3EFE5] p-7 md:flex-row md:items-center">
      <h3 className="shrink-0 text-lg font-bold tracking-tight text-[#1E4D40] md:w-28">
        {title}
      </h3>
      <span className="shrink-0 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-[#B08D57]">
        内容完善中
      </span>
      <ul className="flex flex-wrap gap-2">
        {modules.map((module) => (
          <li
            key={module}
            className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-[#4E5B4A]"
          >
            {module}
          </li>
        ))}
      </ul>
    </article>
  );
}

function Features() {
  return (
    <section id="features" className="mx-auto max-w-5xl scroll-mt-24 px-6 pb-32">
      <div className="border-t border-[#E8E2D4] pt-16">
        <span className="font-mono text-xs font-bold text-[#E89B4B]">01</span>
        <h2 className="mt-2 text-3xl font-black tracking-tight text-[#1E4D40]">
          功能介绍
        </h2>
      </div>

      <p className="mt-14 text-sm font-bold text-[#63705F]">用户端</p>
      <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
        {USER_MODULES.slice(0, 4).map((data, index) => (
          <ModuleCard key={data.module} data={data} index={index} />
        ))}
        <div className="md:col-span-2">
          <ModuleCard data={USER_MODULES[4]} index={4} />
        </div>
      </div>

      <div className="mt-8 space-y-5">
        <RowCard title="家长端" modules={PARENT_MODULES} />
        <RowCard title="管理端" modules={ADMIN_MODULES} />
      </div>
    </section>
  );
}

export default function StyleC() {
  return (
    <div className="min-h-dvh bg-[#FAF7F0] text-[#1E4D40]">
      <Navbar />
      <main>
        <Hero />
        <Features />
      </main>
    </div>
  );
}
