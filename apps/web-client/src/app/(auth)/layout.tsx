import { Starfield } from "@/components/cosmic/starfield";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Starfield />
      <div className="relative z-10 flex min-h-screen flex-col px-4">
        <main className="flex flex-1 items-center justify-center py-10">
          {children}
        </main>
        <footer className="pb-6 text-center text-xs text-cosmic-footer">
          <a
            href="https://beian.miit.gov.cn/"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-cosmic-blue"
          >
            粤ICP备2025440449号
          </a>
        </footer>
      </div>
    </>
  );
}
