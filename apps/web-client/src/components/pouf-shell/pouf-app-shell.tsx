import { PoufNavBar } from "./pouf-nav-bar";
import { PoufFooter } from "./pouf-footer";
import Particles from "@/components/effects/Particles";
import { FeedbackDialogProvider } from "@/components/feedback/feedback-dialog";

/** The pouf home shell. A clean lavender base with a soft, slow-drifting
 *  particle field (ogl / React Bits) as the background; the nav and footer are
 *  pouf-redrawn variants of the cosmic shell; page text runs in Nunito. */
export function PoufAppShell({ children }: { children: React.ReactNode }) {
  return (
    <FeedbackDialogProvider>
      {/* Full-screen pouf background: bright soft gradient + blurred glows, with
          a gentle particle field floating above. */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        {/* Bright lavender gradient base. */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(160deg, #f4eefc 0%, #eee1fb 48%, #f6edf7 100%)",
          }}
        />
        {/* Soft blurred glow washes (the frosted effect), low alpha. */}
        <div
          className="absolute -left-[14%] -top-[18%] h-[52vw] w-[52vw] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(158,224,190,0.4), transparent 66%)",
            filter: "blur(80px)",
          }}
        />
        <div
          className="absolute -right-[12%] top-[4%] h-[48vw] w-[48vw] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(196,154,240,0.34), transparent 66%)",
            filter: "blur(90px)",
          }}
        />
        <div
          className="absolute bottom-[-18%] left-[14%] h-[46vw] w-[46vw] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(243,166,201,0.3), transparent 68%)",
            filter: "blur(90px)",
          }}
        />
        {/* Gentle, slower particle drift. */}
        <div className="absolute inset-0">
          <Particles
            particleCount={520}
            particleSpread={10}
            speed={0.7}
            particleColors={["#bb9fe6", "#93cfae", "#8bb6e8", "#efaec7"]}
            moveParticlesOnHover={false}
            alphaParticles
            particleBaseSize={80}
            sizeRandomness={1.2}
            pixelRatio={2}
          />
        </div>
      </div>

      <div className="relative z-10 flex min-h-[100dvh] flex-col font-pouf text-ink">
        <PoufNavBar />
        <main className="flex-1">{children}</main>
        <PoufFooter />
      </div>
    </FeedbackDialogProvider>
  );
}
