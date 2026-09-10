"use client";

import Link from "next/link";
import Aurora from "./aurora";
import BlurText from "./blur-text";
import ClickSpark from "./click-spark";
import Counter from "./counter";
import { HeroIntro } from "./style-data";

// 简介文案逐字来自《官网需呈现内容》第 1 节；统计行三项均出自原文事实
//（6-24 岁青少年群体 / 用户端、家长端、管理端三端协同 / 用户端五大模块）。
export default function HeroSection() {
  const scrollToAppDownload = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    document.querySelector("#app-download")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="hero" className="relative overflow-hidden pt-16">
      {/* Aurora 流体光斑背景：低饱和紫蓝、低透明度（ogl，reduced-motion 静态首帧） */}
      <Aurora />

      <div className="relative mx-auto max-w-5xl px-6 pb-24 pt-28 text-center md:pt-36">
        <h1 className="official-brand-font text-5xl font-black leading-tight tracking-tight text-[#4A4266] md:text-[64px]">
          <BlurText text="心愈智联" />
        </h1>
        <p className="mt-5 text-lg text-[#8A84A3]">青少年心理健康 AI 平台</p>

        <HeroIntro className="mx-auto mt-9 max-w-2xl text-[15px] leading-[2] text-[#8A84A3] [&_strong]:font-bold [&_strong]:text-[#6F64A8]" />

        <div className="mt-11 flex flex-wrap items-center justify-center gap-4">
          <ClickSpark>
            <Link
              href="/login"
              className="block rounded-full bg-[#8B7CC8] px-9 py-3.5 text-sm font-bold text-white shadow-[0_10px_28px_rgba(139,124,200,0.35)] transition-colors hover:bg-[#7A6BBA]"
            >
              网页版入口
            </Link>
          </ClickSpark>
          <button
            type="button"
            onClick={scrollToAppDownload}
            className="rounded-full border-2 border-[#D8D2EC] bg-white px-9 py-3.5 text-sm font-bold text-[#6F64A8] transition-colors hover:border-[#B9AEE4]"
          >
            APP 下载
          </button>
        </div>

        {/* 统计行：数字滚动入场（GSAP Counter），三项均出自原文 */}
        <dl className="mt-16 flex flex-wrap items-start justify-center gap-10 md:gap-20">
          <div className="flex flex-col items-center">
            <dt className="order-2 mt-2 text-xs text-[#8A84A3]">服务青少年年龄（岁）</dt>
            <dd className="order-1 text-4xl font-extrabold tracking-tight text-[#4A4266]">
              6-<Counter to={24} className="text-[#8B7CC8]" />
            </dd>
          </div>
          <div className="flex flex-col items-center">
            <dt className="order-2 mt-2 text-xs text-[#8A84A3]">用户端 · 家长端 · 管理端</dt>
            <dd className="order-1 text-4xl font-extrabold tracking-tight text-[#4A4266]">
              <Counter to={3} className="text-[#8B7CC8]" />
              <span className="ml-1 text-2xl">端协同</span>
            </dd>
          </div>
          <div className="flex flex-col items-center">
            <dt className="order-2 mt-2 text-xs text-[#8A84A3]">用户端核心功能</dt>
            <dd className="order-1 text-4xl font-extrabold tracking-tight text-[#4A4266]">
              <Counter to={5} className="text-[#8B7CC8]" />
              <span className="ml-1 text-2xl">大模块</span>
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
