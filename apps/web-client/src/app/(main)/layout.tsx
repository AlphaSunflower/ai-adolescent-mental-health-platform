import { Starfield } from "@/components/cosmic/starfield";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Starfield />
      <div className="relative z-10 flex min-h-screen flex-col">
        <main className="flex-1">{children}</main>
        <footer className="border-t border-white/10 py-8 text-center text-sm text-cosmic-footer">
          <div className="mx-auto max-w-6xl px-4">
            © 2025 心愈智联 — 青少年心理健康 AI 平台
          </div>
        </footer>
      </div>
    </>
  );
}
