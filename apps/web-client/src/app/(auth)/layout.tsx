import GridDistortion from "@/components/effects/GridDistortion";
import type { ReactNode } from "react";

export default function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      {/* Full-screen galaxy background + global mouse-rhythm distortion. */}
      <div aria-hidden className="fixed inset-0 overflow-hidden">
        <GridDistortion
          imageSrc="/login-bg.png"
          grid={12}
          mouse={0.05}
          strength={0.1}
          relaxation={0.9}
        />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col px-4">
        <main className="flex flex-1 items-center justify-center py-10">
          {children}
        </main>
        <footer className="pb-6 text-center text-xs text-white/70">
          <a
            href="https://beian.miit.gov.cn/"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-white"
          >
            粤ICP备2025440449号
          </a>
        </footer>
      </div>
    </>
  );
}
