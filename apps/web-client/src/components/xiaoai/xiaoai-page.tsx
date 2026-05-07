"use client";

import Link from "next/link";
import { Headphones, Heart, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function XiaoaiPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:py-16">
      <div className="text-center mb-12">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-purple-500/10 px-4 py-1.5 text-sm text-purple-400 border border-purple-500/20">
          <Sparkles className="size-4" />
          情绪支持
        </div>
        <h1 className="cosmic-gradient-text text-4xl font-extrabold md:text-5xl">
          小艾倾听
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-cosmic-muted">
          在这里，你可以自由地表达内心的感受，小艾会用最温暖的方式倾听你的故事
        </p>
      </div>

      <div className="mb-12 grid gap-6 sm:grid-cols-3">
        <div className="cosmic-card p-6 text-center">
          <div className="mx-auto mb-4 size-14 rounded-full bg-purple-500/20 flex items-center justify-center">
            <Headphones className="size-7 text-purple-400" />
          </div>
          <h3 className="mb-1 font-semibold text-white">倾听模式</h3>
          <p className="text-sm text-cosmic-muted">专注倾听你的每一句话，不评判，不说教</p>
        </div>
        <div className="cosmic-card p-6 text-center">
          <div className="mx-auto mb-4 size-14 rounded-full bg-pink-500/20 flex items-center justify-center">
            <Heart className="size-7 text-pink-400" />
          </div>
          <h3 className="mb-1 font-semibold text-white">情感支持</h3>
          <p className="text-sm text-cosmic-muted">温暖的回应让你感受到被理解和被接纳</p>
        </div>
        <div className="cosmic-card p-6 text-center">
          <div className="mx-auto mb-4 size-14 rounded-full bg-cyan-500/20 flex items-center justify-center">
            <Sparkles className="size-7 text-cyan-400" />
          </div>
          <h3 className="mb-1 font-semibold text-white">情绪疏导</h3>
          <p className="text-sm text-cosmic-muted">引导你发现内心的力量，找到前行的方向</p>
        </div>
      </div>

      <div className="text-center">
        <Link href="/ai">
          <Button variant="primary" size="lg" className="gap-2">
            开始倾听
            <ArrowRight className="size-4" />
          </Button>
        </Link>
        <p className="mt-4 text-sm text-cosmic-dim">
          小艾倾听目前通过 AI 咨询功能提供服务
        </p>
      </div>
    </div>
  );
}
