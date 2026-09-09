import Link from "next/link";

// 《官网需呈现内容》第 2 节为占位无正文：二维码素材待补充，此处用样式化占位块 + 约定文案。
export default function DownloadSection() {
  return (
    <section id="download" className="relative mx-auto max-w-6xl scroll-mt-24 px-6 py-24">
      <div className="official-glass relative mx-auto max-w-4xl overflow-hidden rounded-[32px] p-8 md:p-12">
        <div className="official-grid-bg absolute inset-0" aria-hidden="true" />

        <div className="relative flex flex-col items-center gap-10 md:flex-row md:justify-between">
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-black text-[var(--ink)] md:text-4xl">APP 下载</h2>
            <div className="official-gradient-text mt-4 ml-0 h-1 w-16 rounded-full md:ml-0" />
            <p className="mt-6 text-lg font-bold text-[var(--ink)]">扫码下载（即将上线）</p>
            <Link
              href="/home"
              className="mt-8 inline-block rounded-full bg-[var(--purple)] px-8 py-3.5 font-bold text-[var(--on-accent)] shadow-lg transition-transform hover:scale-105"
            >
              进入平台
            </Link>
          </div>

          {/* 二维码样式化占位块（非真实二维码） */}
          <div className="official-float relative flex flex-col items-center">
            <div className="official-qr-placeholder relative h-52 w-52 rounded-[28px] border-2 border-dashed border-[rgba(58,46,92,0.4)] bg-white/60">
              <span className="absolute left-3 top-3 h-8 w-8 rounded-md border-4 border-[rgba(58,46,92,0.55)]" />
              <span className="absolute right-3 top-3 h-8 w-8 rounded-md border-4 border-[rgba(58,46,92,0.55)]" />
              <span className="absolute bottom-3 left-3 h-8 w-8 rounded-md border-4 border-[rgba(58,46,92,0.55)]" />
            </div>
            <p className="mt-4 text-sm text-[var(--muted)]">二维码占位 · 素材待补充</p>
          </div>
        </div>
      </div>
    </section>
  );
}
