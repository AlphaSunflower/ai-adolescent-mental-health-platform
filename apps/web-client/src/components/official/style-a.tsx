"use client";

/**
 * 风格方案 A「深色科技」（对标 linear.app）：
 * 深色底、单色系+一个强调色（#6E6ADE）、大字重标题、克制留白、细线条。
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
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.06] bg-[#101014]/85 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
        <a href="#hero" className="flex items-center gap-2.5">
          <img
            src="/logo.png"
            alt="心愈智联 Logo"
            className="h-9 w-auto object-contain"
          />
          <span className="text-[15px] font-bold tracking-tight text-[#F7F8F8]">
            心愈智联
          </span>
        </a>
        <div className="flex items-center gap-6">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-[#9CA0AA] transition-colors hover:text-[#F7F8F8]"
            >
              {link.label}
            </a>
          ))}
          <Link
            href="/home"
            className="rounded-lg border border-white/[0.14] px-4 py-1.5 text-sm font-medium text-[#F7F8F8] transition-colors hover:bg-white/[0.06]"
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
      <div className="mx-auto max-w-5xl px-6 pb-28 pt-32 text-center md:pt-40">
        <h1 className="text-5xl font-bold leading-tight tracking-tight text-[#F7F8F8] md:text-[64px]">
          心愈智联
        </h1>
        <p className="mt-5 text-lg text-[#9CA0AA]">
          青少年心理健康 AI 平台
        </p>
        <HeroIntro className="mx-auto mt-9 max-w-2xl text-[15px] leading-[1.9] text-[#9CA0AA] [&_strong]:font-semibold [&_strong]:text-[#F7F8F8]" />
        <div className="mt-11 flex flex-wrap items-center justify-center gap-3">
          <Link
            href={HERO_BUTTONS.primary.href}
            className="rounded-lg bg-[#F7F8F8] px-6 py-3 text-sm font-semibold text-[#101014] transition-colors hover:bg-white"
          >
            {HERO_BUTTONS.primary.label}
          </Link>
          <a
            href={HERO_BUTTONS.secondary.href}
            className="rounded-lg border border-white/[0.14] px-6 py-3 text-sm font-medium text-[#F7F8F8] transition-colors hover:bg-white/[0.06]"
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
    <article className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-7">
      <div className="flex items-baseline gap-3">
        <span className="font-mono text-xs font-semibold text-[#6E6ADE]">
          {String(index + 1).padStart(2, "0")}
        </span>
        <h3 className="text-base font-semibold tracking-tight text-[#F7F8F8]">
          {data.module}
        </h3>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-[#9CA0AA]">{data.tagline}</p>
      <ul className="mt-5 flex flex-wrap gap-2">
        {data.features.map((feature) => (
          <li
            key={feature}
            className="rounded-md border border-white/[0.1] px-2.5 py-1 text-xs text-[#C8CAD1]"
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
    <article className="flex flex-col gap-4 rounded-xl border border-white/[0.08] bg-white/[0.03] p-7 md:flex-row md:items-center">
      <h3 className="shrink-0 text-base font-semibold tracking-tight text-[#F7F8F8] md:w-32">
        {title}
      </h3>
      <span className="shrink-0 rounded-md border border-white/[0.1] px-2.5 py-1 text-xs text-[#9CA0AA]">
        内容完善中
      </span>
      <ul className="flex flex-wrap gap-2">
        {modules.map((module) => (
          <li
            key={module}
            className="rounded-md border border-white/[0.1] px-2.5 py-1 text-xs text-[#C8CAD1]"
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
      <div className="flex items-baseline gap-3 border-t border-white/[0.06] pt-16">
        <span className="font-mono text-xs font-semibold text-[#6E6ADE]">01</span>
        <h2 className="text-2xl font-bold tracking-tight text-[#F7F8F8] md:text-3xl">
          功能介绍
        </h2>
      </div>

      <p className="mt-14 text-sm font-medium text-[#9CA0AA]">用户端</p>
      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
        {USER_MODULES.slice(0, 4).map((data, index) => (
          <ModuleCard key={data.module} data={data} index={index} />
        ))}
        <div className="md:col-span-2">
          <ModuleCard data={USER_MODULES[4]} index={4} />
        </div>
      </div>

      <div className="mt-10 space-y-4">
        <RowCard title="家长端" modules={PARENT_MODULES} />
        <RowCard title="管理端" modules={ADMIN_MODULES} />
      </div>
    </section>
  );
}

export default function StyleA() {
  return (
    <div className="min-h-dvh bg-[#101014] text-[#F7F8F8]">
      <Navbar />
      <main>
        <Hero />
        <Features />
      </main>
    </div>
  );
}
