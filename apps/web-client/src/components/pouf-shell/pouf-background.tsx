import Particles from "@/components/effects/Particles";

/** The pouf app background: a bright lavender gradient base with soft blurred
 *  glow washes and a slow particle drift. Shared by the home shell and the
 *  (auth) pages so /login, /register and /forgot-password read as the same
 *  surface as /home.
 *
 *  `showParticles` lets a route ask for the calmer variant (gradient + glows
 *  only, no drifting dots) when a busy particle field would fight the content —
 *  the /ai chat page does this. */
export function PoufBackground({ showParticles = true }: { showParticles?: boolean }) {
  return (
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
      {showParticles && (
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
      )}
    </div>
  );
}
