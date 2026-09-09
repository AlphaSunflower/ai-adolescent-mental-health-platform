import Link from "next/link";

// 模块名与「核心功能概览」均为《官网需呈现内容》第 1、3 节原文
const CORE_MODULES = [
  "AI情绪陪伴模块",
  "心理自助工具模块",
  "安全与预警模块",
  "成长档案模块",
  "每日打卡与智能体养成模块",
];

const AUDIENCES = ["青少年", "家长", "学校", "少年宫", "咨询师"];

export default function HeroSection() {
  return (
    <section id="hero" className="relative overflow-hidden pt-16">
      <div className="official-grid-bg absolute inset-0" aria-hidden="true" />
      <div
        className="aurora-blob"
        style={{ width: "36vw", height: "36vw", background: "var(--pink)", top: "-12%", left: "-10%" }}
        aria-hidden="true"
      />
      <div
        className="aurora-blob"
        style={{ width: "32vw", height: "32vw", background: "var(--blue)", top: "12%", right: "-12%" }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-6xl px-6 pb-24 pt-24 text-center">
        <h1 className="official-brand-font official-gradient-text text-6xl font-black tracking-wide md:text-7xl">
          心愈智联
        </h1>
        <p className="mt-4 text-lg text-[var(--muted)] md:text-xl">青少年心理健康 AI 平台</p>

        {/* 《官网需呈现内容》第 1 节「项目简介」原文（加粗对应原文 ** 强调） */}
        <p className="mx-auto mt-10 max-w-3xl text-left text-base leading-relaxed text-[var(--ink)]/85 md:text-center md:text-lg">
          本项目是一款面向 6-24 岁青少年群体的智能化健康服务产品，核心定位为<strong>专业体系支撑的 AI 辅助心理咨询智能体平台</strong>，打通“AI初筛测评 — 持续情绪干预 — 专业咨询师转接”全服务链路，为不同需求层级的用户提供匹配的心理健康支持。产品分<strong>用户端、家长端、管理端</strong>三端协同运行，服务对象为青少年、家长、学校、少年宫、咨询师。
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {AUDIENCES.map((audience) => (
            <span
              key={audience}
              className="official-glass rounded-full px-4 py-1.5 text-sm text-[var(--muted)]"
            >
              {audience}
            </span>
          ))}
        </div>

        <div className="mt-16">
          <p className="text-sm font-bold tracking-[0.3em] text-[var(--muted)]">核心功能概览</p>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {CORE_MODULES.map((module, index) => (
              <div
                key={module}
                className="official-glass official-float rounded-[24px] p-5 text-left"
                style={{ animationDelay: `${index * 0.6}s` }}
              >
                <span className="official-gradient-text text-sm font-black">
                  {`0${index + 1}`}
                </span>
                <p className="mt-2 font-bold leading-snug">{module}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/home"
            className="rounded-full bg-[var(--purple)] px-8 py-3.5 font-bold text-[var(--on-accent)] shadow-lg transition-transform hover:scale-105"
          >
            进入平台
          </Link>
          <a
            href="#features"
            className="official-glass rounded-full px-8 py-3.5 font-bold text-[var(--ink)] transition-transform hover:scale-105"
          >
            功能介绍
          </a>
        </div>
      </div>
    </section>
  );
}
