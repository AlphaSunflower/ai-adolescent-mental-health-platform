"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";

interface PlatformIntroProps {
  open: boolean;
  onClose: () => void;
}

const FEATURES = [
  { title: "AI 心理健康助手", desc: "24 小时在线的 AI 心理咨询师「小艾」，随时倾听你的心声" },
  { title: "专业心理咨询", desc: "连接认证心理咨询师，提供线上/线下专业咨询服务" },
  { title: "心理测评量表", desc: "科学专业的心理健康评估工具，了解自己的心理状态" },
  { title: "健康内容馆", desc: "精选心理健康文章、课程、书籍，助力自我成长" },
  { title: "青少年专属", desc: "专为青少年设计的界面和内容，安全、温暖、可信赖" },
  { title: "家长协同", desc: "家长端支持查看孩子的心理状态和咨询进展" },
  { title: "隐私保护", desc: "严格的隐私保护机制，你的每一次倾诉都安全保密" },
];

const TARGET_USERS = ["青少年（12-18 岁）", "家长", "大学生", "教育工作者"];

export function PlatformIntro({ open, onClose }: PlatformIntroProps) {
  return (
    <Dialog defaultOpen={open}>
      <DialogContent className="max-w-2xl" showClose={false}>
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">欢迎来到心愈智联</DialogTitle>
          <DialogDescription className="text-center">
            青少年心理健康 AI 平台 — 用科技守护每一颗年轻的心
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 px-2">
          {/* Features */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-cosmic-nav-hover">平台功能</h4>
            <ol className="space-y-3">
              {FEATURES.map((f, i) => (
                <li key={i} className="flex gap-3 text-sm">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-cosmic-blue/20 text-xs text-cosmic-blue">
                    {i + 1}
                  </span>
                  <div>
                    <span className="font-medium text-white">{f.title}</span>
                    <span className="ml-2 text-cosmic-muted">{f.desc}</span>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* Target users */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-cosmic-nav-hover">适用人群</h4>
            <div className="flex flex-wrap gap-2">
              {TARGET_USERS.map((u) => (
                <span key={u} className="cosmic-tag text-xs">{u}</span>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="rounded-xl bg-cosmic-lavender/10 p-4 text-center text-sm text-cosmic-muted">
            如有疑问请联系：support@xinyuzhilian.com
          </div>
        </div>

        <div className="flex justify-center border-t border-white/10 px-6 py-4">
          <DialogClose className="cosmic-btn-primary px-8">我已了解，开始使用</DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
