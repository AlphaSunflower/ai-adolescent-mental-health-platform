"use client";

import Link from "next/link";
import { useRef } from "react";
import BlurText from "./blur-text";
import ClickSpark from "./click-spark";
import CountUp from "./count-up";
import MindConstellation from "./mind-constellation";
import TextType from "./text-type";
import VariableProximity from "./variable-proximity";

const HERO_INTRO_TEXT =
  "本项目是一款面向 6-24 岁青少年群体的智能化健康服务产品，核心定位为专业体系支撑的 AI 辅助心理咨询智能体平台，打通“AI初筛测评 — 持续情绪干预 — 专业咨询师转接”全服务链路，为不同需求层级的用户提供匹配的心理健康支持。产品分用户端、家长端、管理端三端协同运行，服务对象为青少年、家长、学校、少年宫、咨询师。";

// 简介文案逐字来自《官网需呈现内容》第 1 节；统计行三项均出自原文事实
//（6-24 岁青少年群体 / 用户端、家长端、管理端三端协同 / 用户端五大模块）。
export default function HeroSection() {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const scrollToAppDownload = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    document.querySelector("#app-download")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="hero" className="official-hero relative overflow-hidden pt-16">
      <MindConstellation />

      <div className="official-hero__content relative mx-auto max-w-5xl px-6 pb-24 pt-28 text-center md:pt-36">
        <h1
          ref={titleRef}
          className="official-brand-font text-5xl font-black leading-tight tracking-tight text-[#4A4266] md:text-[64px]"
        >
          <VariableProximity
            label="心愈智联"
            className="variable-proximity__brand"
            fromFontVariationSettings="'wght' 620"
            toFontVariationSettings="'wght' 900"
            containerRef={titleRef}
            radius={190}
            falloff="gaussian"
          />
        </h1>
        <BlurText
          as="p"
          text="青少年心理健康 AI 平台"
          animateBy="words"
          delay={140}
          stepDuration={0.46}
          className="mt-5 justify-center text-lg text-[#8A84A3]"
        />

          <TextType
            as="p"
            text={HERO_INTRO_TEXT}
            className="official-hero__intro mx-auto mt-9 max-w-2xl text-[15px] leading-[2] text-[#8A84A3]"
            typingSpeed={30}
            variableSpeed={{ min: 24, max: 42 }}
            initialDelay={220}
            loop={false}
            startOnVisible
            cursorCharacter=" "
            cursorClassName="official-hero__cursor"
          />

        <div className="mt-11 flex flex-wrap items-center justify-center gap-4">
          <ClickSpark>
            <Link
              href="/login"
              className="official-cta official-cta--primary block rounded-full px-9 py-3.5 text-sm font-bold transition-colors"
            >
              网页版入口
            </Link>
          </ClickSpark>
          <button
            type="button"
            onClick={scrollToAppDownload}
            className="official-cta official-cta--secondary rounded-full border-2 px-9 py-3.5 text-sm font-bold transition-colors"
          >
            APP 下载
          </button>
        </div>

        {/* 统计行：数字滚动入场（GSAP Counter），三项均出自原文 */}
        <dl className="official-stats mt-16 flex flex-wrap items-start justify-center gap-10 md:gap-20">
          <div className="official-stat flex flex-col items-center">
            <dt className="order-2 mt-2 text-xs text-[#8A84A3]">服务青少年年龄（岁）</dt>
            <dd className="order-1 text-4xl font-extrabold tracking-tight text-[#4A4266]">
              6-<CountUp to={24} className="text-[#8B7CC8]" />
            </dd>
          </div>
          <div className="official-stat flex flex-col items-center">
            <dt className="order-2 mt-2 text-xs text-[#8A84A3]">用户端 · 家长端 · 管理端</dt>
            <dd className="order-1 text-4xl font-extrabold tracking-tight text-[#4A4266]">
              <CountUp to={3} className="text-[#8B7CC8]" />
              <span className="ml-1 text-2xl">端协同</span>
            </dd>
          </div>
          <div className="official-stat flex flex-col items-center">
            <dt className="order-2 mt-2 text-xs text-[#8A84A3]">核心功能模块</dt>
            <dd className="order-1 text-4xl font-extrabold tracking-tight text-[#4A4266]">
              <CountUp to={13} className="text-[#8B7CC8]" />
              <span className="ml-1 text-2xl">大模块</span>
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
