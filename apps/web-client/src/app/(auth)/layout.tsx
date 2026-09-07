import { PoufBackground } from "@/components/pouf-shell/pouf-background";
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
    <>
      {/* Full-screen pouf background, the same lavender surface as /home. */}
      <PoufBackground />

      <div className="relative z-10 flex min-h-screen flex-col px-4">
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
    </>
  );
}
