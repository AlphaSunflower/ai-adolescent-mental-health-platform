"use client";

/**
 * 风格方案 B「浅色柔和」（对标一源心理）：
 * 浅底、柔和紫蓝、圆润卡片、大圆角与柔阴影营造插画感与亲和力。
 * 仅 Hero + 功能介绍两屏，静态无动效。
 */
import Link from "next/link";
import "./official.css";
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
    <header className="fixed inset-x-0 top-0 z-50 bg-white/85 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
        <a href="#hero" className="flex items-center gap-2.5">
          <img
            src="/logo.png"
            alt="心愈智联 Logo"
            className="h-9 w-auto object-contain"
          />
          <span className="official-brand-font text-lg font-bold text-[#4A4266]">
            心愈智联
          </span>
        </a>
        <div className="flex items-center gap-7">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-[#8A84A3] transition-colors hover:text-[#4A4266]"
            >
              {link.label}
            </a>
          ))}
          <Link
            href="/home"
            className="rounded-full bg-[#8B7CC8] px-5 py-2 text-sm font-bold text-white transition-colors hover:bg-[#7A6BBA]"
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
    <section id="hero" className="relative overflow-hidden pt-16">
      {/* 柔和紫蓝光斑：静态、低饱和，营造亲和插画感 */}
      <div
        aria-hidden="true"
        className="absolute -top-24 left-1/2 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-[#E9E3FA] blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute right-[8%] top-24 h-40 w-40 rounded-full bg-[#DDE7FA] opacity-70 blur-2xl"
      />

      <div className="relative mx-auto max-w-5xl px-6 pb-28 pt-32 text-center md:pt-40">
        <h1 className="text-5xl font-extrabold leading-tight tracking-tight text-[#4A4266] md:text-[64px]">
          心愈智联
        </h1>
        <p className="mt-5 text-lg text-[#8A84A3]">青少年心理健康 AI 平台</p>
        <HeroIntro className="mx-auto mt-9 max-w-2xl text-[15px] leading-[2] text-[#8A84A3] [&_strong]:font-bold [&_strong]:text-[#6F64A8]" />
        <div className="mt-11 flex flex-wrap items-center justify-center gap-4">
          <Link
            href={HERO_BUTTONS.primary.href}
            className="rounded-full bg-[#8B7CC8] px-9 py-3.5 text-sm font-bold text-white shadow-[0_10px_28px_rgba(139,124,200,0.35)] transition-colors hover:bg-[#7A6BBA]"
          >
            {HERO_BUTTONS.primary.label}
          </Link>
          <a
            href={HERO_BUTTONS.secondary.href}
            className="rounded-full border-2 border-[#D8D2EC] bg-white px-9 py-3.5 text-sm font-bold text-[#6F64A8] transition-colors hover:border-[#B9AEE4]"
          >
            {HERO_BUTTONS.secondary.label}
          </a>
        </div>
      </div>
    </section>
  );
}

function ModuleCard({ data, index }: { data: FeatureModule; index: number }) {
  return (
    <article className="rounded-[28px] bg-white p-8 shadow-[0_10px_36px_rgba(139,124,200,0.12)]">
      <div className="flex items-center gap-4">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EFEBFA] text-sm font-bold text-[#7A6BBA]">
          {String(index + 1).padStart(2, "0")}
        </span>
        <h3 className="text-lg font-bold tracking-tight text-[#4A4266]">
          {data.module}
        </h3>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-[#8A84A3]">{data.tagline}</p>
      <ul className="mt-5 flex flex-wrap gap-2">
        {data.features.map((feature) => (
          <li
            key={feature}
            className="rounded-full bg-[#F1EEFA] px-3.5 py-1.5 text-xs font-medium text-[#6F64A8]"
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
    <article className="flex flex-col gap-4 rounded-[28px] bg-white p-7 shadow-[0_10px_36px_rgba(139,124,200,0.10)] md:flex-row md:items-center">
      <h3 className="shrink-0 text-lg font-bold tracking-tight text-[#4A4266] md:w-28">
        {title}
      </h3>
      <span className="shrink-0 rounded-full bg-[#FBF4E8] px-3.5 py-1.5 text-xs font-medium text-[#B08D57]">
        内容完善中
      </span>
      <ul className="flex flex-wrap gap-2">
        {modules.map((module) => (
          <li
            key={module}
            className="rounded-full bg-[#F1EEFA] px-3.5 py-1.5 text-xs font-medium text-[#6F64A8]"
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
      <div className="text-center">
        <h2 className="text-3xl font-extrabold tracking-tight text-[#4A4266]">
          功能介绍
        </h2>
        <div className="mx-auto mt-4 h-1.5 w-14 rounded-full bg-[#D8D2EC]" />
      </div>

      <p className="mt-14 text-sm font-bold text-[#8A84A3]">用户端</p>
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

export default function StyleB() {
  return (
    <div className="min-h-dvh bg-[#FBFAFF] text-[#4A4266]">
      <Navbar />
      <main>
        <Hero />
        <Features />
      </main>
    </div>
  );
}
