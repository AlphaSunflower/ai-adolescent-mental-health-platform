import Link from "next/link";
import TextPressure from "@/components/effects/TextPressure";
import type { ReactNode } from "react";

// 认证页必须始终返回当前构建：禁止静态预渲染，防止部署换版后服务端短时间内
// 下发旧版预渲染 HTML（其引用的已删除资源如 /login-bg.png 会 404 → 背景消失）。
export const dynamic = "force-dynamic";

// 品牌字「心愈智联」的可变字体（wght 100-900）以 base64 @font-face 内联在 globals.css，
// 族名 "Noto Sans SC Brand"：不产生独立 .woff2 请求，避免被代理/安全软件按扩展名 403
// 导致字体回退到非可变系统字体、`font-variation-settings` 失效；子集仅含四字（2.7KB）。
const BRAND_FONT = "'Noto Sans SC Brand', 'Nunito Variable', 'Nunito', system-ui, sans-serif";

export default function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="relative z-10 flex min-h-screen flex-col px-4">
      {/* Brand mark — TextPressure 可变字重逐字变形，左上角 */}
      <div className="absolute left-6 top-6 z-20 sm:left-10 sm:top-8">
        <div className="h-12 w-56 sm:h-14 sm:w-64">
          <TextPressure
            text="心愈智联"
            fontFamily={BRAND_FONT}
            flex={false}
            alpha={false}
            stroke={false}
            width={true}
            weight={true}
            italic={false}
            scale={false}
            textColor="var(--ink)"
            minFontSize={36}
            fontSize={36}
            className="brand-title"
          />
        </div>
      </div>

      <main className="flex flex-1 items-center justify-center py-10">
        {children}
      </main>
      <footer className="pb-6 text-center text-xs font-bold text-muted">
        <p className="mb-2 text-sm">
          <Link href="/index" className="transition-colors hover:text-ink">
            访问官网
          </Link>
        </p>
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
