"use client";

/**
 * Pure CSS cosmic starfield background.
 * 4 layers of stars + 3 planets + 1 comet — zero JS overhead.
 * Recreated from web-admin's cosmic-theme.css starfield implementation.
 */
export function Starfield() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      {/* Starfield base gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(to bottom, #0a0a2a, #1a1a4a, #2a2a6a)",
        }}
      />

      {/* Stars layer 1 — 2px dots, 100px grid, 200s scroll */}
      <div
        className="absolute inset-0 animate-stars-move"
        style={{
          backgroundImage:
            "radial-gradient(2px 2px at 20px 30px, #fff, transparent), radial-gradient(2px 2px at 60px 80px, #fff, transparent), radial-gradient(2px 2px at 90px 40px, #fff, transparent), radial-gradient(2px 2px at 130px 70px, #fff, transparent), radial-gradient(2px 2px at 170px 20px, #fff, transparent), radial-gradient(2px 2px at 40px 120px, #fff, transparent), radial-gradient(2px 2px at 100px 150px, #fff, transparent), radial-gradient(2px 2px at 160px 100px, #fff, transparent), radial-gradient(2px 2px at 200px 130px, #fff, transparent)",
          backgroundSize: "200px 200px",
        }}
      />

      {/* Stars layer 2 — 1px dots, 150px grid, 150s scroll (faster) */}
      <div
        className="absolute inset-0 animate-stars-move-fast"
        style={{
          backgroundImage:
            "radial-gradient(1px 1px at 15px 50px, rgba(255,255,255,0.8), transparent), radial-gradient(1px 1px at 55px 110px, rgba(255,255,255,0.8), transparent), radial-gradient(1px 1px at 105px 35px, rgba(255,255,255,0.8), transparent), radial-gradient(1px 1px at 145px 95px, rgba(255,255,255,0.8), transparent), radial-gradient(1px 1px at 195px 55px, rgba(255,255,255,0.8), transparent), radial-gradient(1px 1px at 25px 145px, rgba(255,255,255,0.8), transparent), radial-gradient(1px 1px at 85px 175px, rgba(255,255,255,0.8), transparent), radial-gradient(1px 1px at 135px 125px, rgba(255,255,255,0.8), transparent)",
          backgroundSize: "200px 200px",
        }}
      />

      {/* Stars layer 3 — 3px dots, 300px grid, 250s scroll (slowest) */}
      <div
        className="absolute inset-0 animate-stars-move-slow"
        style={{
          backgroundImage:
            "radial-gradient(3px 3px at 30px 60px, rgba(255,255,255,0.3), transparent), radial-gradient(3px 3px at 100px 140px, rgba(255,255,255,0.3), transparent), radial-gradient(3px 3px at 180px 80px, rgba(255,255,255,0.3), transparent), radial-gradient(3px 3px at 60px 180px, rgba(255,255,255,0.3), transparent), radial-gradient(3px 3px at 150px 160px, rgba(255,255,255,0.3), transparent)",
          backgroundSize: "300px 300px",
        }}
      />

      {/* Planet 1 — pink, top right */}
      <div
        className="absolute animate-float rounded-full"
        style={{
          width: 100,
          height: 100,
          top: "10%",
          right: "10%",
          background: "radial-gradient(circle at 30% 30%, #ff9a9e, #fad0c4)",
          opacity: 0.4,
          filter: "blur(2px)",
        }}
      />

      {/* Planet 2 — blue, bottom left */}
      <div
        className="absolute animate-float-reverse rounded-full"
        style={{
          width: 150,
          height: 150,
          bottom: "15%",
          left: "5%",
          background: "radial-gradient(circle at 40% 40%, #a1c4fd, #c2e9fb)",
          opacity: 0.3,
          filter: "blur(3px)",
        }}
      />

      {/* Planet 3 — peach, mid right */}
      <div
        className="absolute animate-float-fast rounded-full"
        style={{
          width: 80,
          height: 80,
          top: "60%",
          right: "20%",
          background: "radial-gradient(circle at 35% 35%, #ffecd2, #fcb69f)",
          opacity: 0.35,
          filter: "blur(2px)",
        }}
      />

      {/* Comet — diagonal streak across screen */}
      <div
        className="absolute animate-comet"
        style={{
          width: 150,
          height: 3,
          background:
            "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent)",
          top: "10%",
          left: "-200px",
        }}
      />
    </div>
  );
}
