"use client";

import { usePathname } from "next/navigation";
import { PoufNavBar } from "./pouf-nav-bar";
import { PoufFooter } from "./pouf-footer";
import { FeedbackDialogProvider } from "@/components/feedback/feedback-dialog";

/** Full-height "immersive" routes that must fill the viewport (a chat / console
 *  surface) with the scroll happening ONLY inside the page — never on the body.
 *  These hide the footer and pin the shell to 100dvh so the page can fill it
 *  and scroll internally (one scrollbar), instead of the body scrolling and
 *  producing a second one. */
const IMMERSIVE_ROUTES = ["/ai", "/xiaoai-listen", "/consultation/chat"];

/** The pouf app shell. A clean lavender base with a soft, slow-drifting
 *  particle field (ogl / React Bits) as the background; the nav and footer are
 *  pouf-redrawn variants of the cosmic shell; page text runs in Nunito.
 *
 *  For immersive routes the footer is dropped and the column is fixed to the
 *  viewport height (overflow-hidden) so the page owns all scrolling. */
export function PoufAppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const immersive = IMMERSIVE_ROUTES.some(
    (r) => pathname === r || pathname.startsWith(r + "/"),
  );

  return (
    <FeedbackDialogProvider>
      {/* The full-screen pouf background is rendered ONCE at the root layout
          (app/layout.tsx) so every route — auth and main alike — reads the same
          global surface. Nothing is repeated here. */}
      <div
        className={`relative z-10 flex flex-col font-pouf text-ink ${
          immersive ? "h-[100dvh] overflow-hidden" : "min-h-[100dvh]"
        }`}
      >
        <PoufNavBar />
        <main className={`flex-1 ${immersive ? "min-h-0" : ""}`}>{children}</main>
        {!immersive && <PoufFooter />}
      </div>
    </FeedbackDialogProvider>
  );
}
