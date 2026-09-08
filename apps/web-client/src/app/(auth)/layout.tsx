import Shuffle from "@/components/effects/Shuffle";
import type { ReactNode } from "react";

// 认证页必须始终返回当前构建：禁止静态预渲染，防止部署换版后服务端短时间内
// 下发旧版预渲染 HTML（其引用的已删除资源如 /login-bg.png 会 404 → 背景消失）。
export const dynamic = "force-dynamic";

export default function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="relative z-10 flex min-h-screen flex-col px-4">
      {/* Brand Shuffle text — top-left corner */}
      <div className="absolute left-6 top-6 sm:left-10 sm:top-8 z-20">
        <Shuffle
          text="心愈智联"
          tag="h1"
          shuffleDirection="right"
          duration={0.35}
          animationMode="evenodd"
          shuffleTimes={1}
          ease="power3.out"
          stagger={0.05}
          threshold={0.1}
          triggerOnce={true}
          triggerOnHover={true}
          respectReducedMotion={true}
          textAlign="left"
          className="text-4xl font-black sm:text-5xl"
          style={{ color: "#3a2e5c" }}
        />
      </div>

      <main className="flex flex-1 items-center justify-center py-10">
        {children}
      </main>
      <footer className="pb-6 text-center text-xs font-bold text-muted">
        <a
          href="https://beian.miit.gov.cn/"
          target="_blank"
          rel="noopener noreferrer"
          className="transition-colors hover:text-ink"
        >
          粤ICP备2025440449号
        </a>
      </footer>
    </div>
  );
}
