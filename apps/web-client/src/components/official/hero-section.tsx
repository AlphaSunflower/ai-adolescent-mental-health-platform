"use client";

import Link from "next/link";
import SplitText from "./split-text";
import ShinyText from "./shiny-text";

// 简介文案逐字来自《官网需呈现内容》第 1 节（加粗对应原文 ** 强调）。
export default function HeroSection() {
  const scrollToAppDownload = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    document.querySelector("#app-download")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="hero" className="pt-16">
      <div className="mx-auto max-w-5xl px-6 pb-28 pt-24 text-center md:pt-32">
        <h1 className="official-brand-font text-[56px] leading-tight font-black tracking-wide text-[var(--ink)] md:text-[76px]">
          <SplitText text="心愈智联" stagger={0.08} />
        </h1>
        <p className="mt-6 text-lg text-[var(--muted)] md:text-xl">
          青少年心理健康 AI 平台
        </p>

        <p className="mx-auto mt-10 max-w-2xl text-[15px] leading-[2] text-[var(--muted)] md:text-base">
          本项目是一款面向 6-24 岁青少年群体的智能化健康服务产品，核心定位为
          <strong className="font-bold text-[var(--ink)]">专业体系支撑的 AI 辅助心理咨询智能体平台</strong>
          ，打通“AI初筛测评 — 持续情绪干预 — 专业咨询师转接”全服务链路，为不同需求层级的用户提供匹配的心理健康支持。产品分
          <strong className="font-bold text-[var(--ink)]">用户端、家长端、管理端</strong>
          三端协同运行，服务对象为青少年、家长、学校、少年宫、咨询师。
        </p>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/login"
            className="rounded-full bg-[var(--purple)] px-10 py-4 font-bold text-[var(--on-accent)] shadow-sm transition-transform duration-300 hover:scale-[1.03]"
          >
            <ShinyText text="网页版入口" speed={4} />
          </Link>
          <button
            type="button"
            onClick={scrollToAppDownload}
            className="rounded-full border border-[rgba(58,46,92,0.18)] bg-white/60 px-10 py-4 font-bold text-[var(--ink)] transition-colors duration-300 hover:bg-white"
          >
            APP 下载
          </button>
        </div>
      </div>
    </section>
  );
}
