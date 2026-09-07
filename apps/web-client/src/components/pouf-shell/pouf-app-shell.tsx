import { PoufNavBar } from "./pouf-nav-bar";
import { PoufFooter } from "./pouf-footer";
import { PoufBackground } from "./pouf-background";
import { FeedbackDialogProvider } from "@/components/feedback/feedback-dialog";

/** The pouf home shell. A clean lavender base with a soft, slow-drifting
 *  particle field (ogl / React Bits) as the background; the nav and footer are
 *  pouf-redrawn variants of the cosmic shell; page text runs in Nunito. */
export function PoufAppShell({ children }: { children: React.ReactNode }) {
  return (
    <FeedbackDialogProvider>
      {/* Full-screen pouf background: bright soft gradient + blurred glows, with
          a gentle particle field floating above. */}
      <PoufBackground />

      <div className="relative z-10 flex min-h-[100dvh] flex-col font-pouf text-ink">
        <PoufNavBar />
        <main className="flex-1">{children}</main>
        <PoufFooter />
      </div>
    </FeedbackDialogProvider>
  );
}
