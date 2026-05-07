"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bot, Calendar, ClipboardCheck, BookOpen, User, ChevronRight, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface Quote {
  content: string;
  author?: string;
}

const DEFAULT_QUOTES: Quote[] = [
  { content: "每一种情绪都值得被看见，每一个你都值得被温柔以待。", author: "心愈智联" },
  { content: "你不必独自面对一切，我们在这里陪伴你。", author: "心愈智联" },
  { content: "成长是一场旅行，心理健康是最好的行囊。", author: "心愈智联" },
  { content: "倾听内心的声音，那是你最真实的力量。", author: "心愈智联" },
];

const SHORTCUTS = [
  { href: "/ai", label: "AI 咨询", desc: "24h 智能陪伴", icon: Bot, gradient: "from-purple-500/20 to-blue-500/20", iconColor: "text-purple-400" },
  { href: "/consultation", label: "心理咨询", desc: "专业咨询师预约", icon: Calendar, gradient: "from-cyan-500/20 to-teal-500/20", iconColor: "text-cyan-400" },
  { href: "/assessment", label: "心理测评", desc: "了解心理状态", icon: ClipboardCheck, gradient: "from-orange-500/20 to-amber-500/20", iconColor: "text-orange-400" },
  { href: "/library", label: "内容馆", desc: "文章·课程·书籍", icon: BookOpen, gradient: "from-green-500/20 to-emerald-500/20", iconColor: "text-green-400" },
  { href: "/me", label: "个人中心", desc: "管理健康档案", icon: User, gradient: "from-pink-500/20 to-rose-500/20", iconColor: "text-pink-400" },
];

export function HomePage() {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const quotes = DEFAULT_QUOTES;

  useEffect(() => {
    const timer = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setQuoteIndex((prev) => (prev + 1) % quotes.length);
        setFade(true);
      }, 500);
    }, 6000);
    return () => clearInterval(timer);
  }, [quotes.length]);

  const currentQuote = quotes[quoteIndex];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:py-16">
      {/* Hero Section */}
      <section className="mb-16 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-cosmic-blue/10 px-4 py-1.5 text-sm text-cosmic-sky border border-cosmic-blue/20">
          <Sparkles className="size-4" />
          青少年心理健康 AI 平台
        </div>
        <h1 className="cosmic-gradient-text text-4xl font-extrabold tracking-tight md:text-6xl">
          心愈智联
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-cosmic-muted md:text-lg">
          用 AI 与专业力量，守护每一颗年轻的心
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link href="/ai">
            <span className="cosmic-btn-primary inline-block rounded-xl px-8 py-3 text-base font-semibold">
              开始 AI 咨询
            </span>
          </Link>
          <Link href="/assessment">
            <span className="cosmic-btn inline-block rounded-xl px-8 py-3 text-base font-medium">
              心理测评
            </span>
          </Link>
        </div>
      </section>

      {/* Daily Quote */}
      <section className="mb-12">
        <Card className="cosmic-card relative overflow-hidden border-cosmic-gold/20">
          <CardContent className="py-8 text-center">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-cosmic-gold/10 px-3 py-1 text-xs text-cosmic-gold">
              <Sparkles className="size-3" /> 每日一语
            </div>
            <blockquote
              className={`mx-auto max-w-lg text-xl italic text-white transition-all duration-500 md:text-2xl ${
                fade ? "opacity-100 translate-y-0" : "opacity-0 translate-y-[-8px]"
              }`}
            >
              "{currentQuote.content}"
            </blockquote>
            {currentQuote.author && (
              <cite className="mt-3 block text-sm text-cosmic-muted not-italic">
                — {currentQuote.author}
              </cite>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Shortcut Grid */}
      <section>
        <h2 className="cosmic-page-title mb-8 text-2xl">
          探索服务
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {SHORTCUTS.map((item) => (
            <Link key={item.href} href={item.href}>
              <Card className="cosmic-card group cursor-pointer p-6 transition-all duration-300 hover:-translate-y-1">
                <div className={`mb-4 inline-flex rounded-xl bg-gradient-to-br ${item.gradient} p-3`}>
                  <item.icon className={`size-6 ${item.iconColor}`} />
                </div>
                <h3 className="mb-1 font-semibold text-white">{item.label}</h3>
                <p className="text-sm text-cosmic-muted">{item.desc}</p>
                <ChevronRight className="ml-auto mt-3 size-4 text-cosmic-dim transition-transform group-hover:translate-x-1" />
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Bottom Section: Recommended */}
      <section className="mt-16">
        <h2 className="cosmic-page-title mb-8 text-2xl">
          为你推荐
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { title: "青少年情绪管理指南", tag: "热门文章", desc: "了解情绪波动的科学原理，学习实用的情绪调节技巧。" },
            { title: "如何与父母有效沟通", tag: "亲子关系", desc: "沟通是桥梁，学会表达自己，也学会理解他人。" },
            { title: "考试焦虑应对策略", tag: "学习压力", desc: "面对考试压力时，试试这些科学验证的减压方法。" },
          ].map((item) => (
            <Link key={item.title} href="/library">
              <Card className="cosmic-card group cursor-pointer p-5 transition-all duration-300 hover:-translate-y-1">
                <span className="cosmic-tag mb-3 inline-block text-xs">{item.tag}</span>
                <h3 className="mb-2 font-semibold text-white group-hover:text-cosmic-nav-hover transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm text-cosmic-muted">{item.desc}</p>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
