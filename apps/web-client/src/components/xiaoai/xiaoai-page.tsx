"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, Headphones, ArrowRight, Sparkles } from "lucide-react";
import gsap from "gsap";

type Particle = { left: string; top: string; delay: string; duration: string; width: string; height: string };

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, () => ({
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    delay: `${Math.random() * 5}s`,
    duration: `${4 + Math.random() * 4}s`,
    width: `${2 + Math.random() * 4}px`,
    height: `${2 + Math.random() * 4}px`,
  }));
}

export function XiaoaiPage() {
  const router = useRouter();
  const [hovered, setHovered] = useState<"left" | "right" | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLButtonElement>(null);
  const rightRef = useRef<HTMLButtonElement>(null);
  const [animating, setAnimating] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    setParticles(generateParticles(20));
  }, []);

  const handleEnter = useCallback((card: "left" | "right") => {
    if (animating) return;
    setAnimating(true);
    const targetRef = card === "left" ? leftRef : rightRef;
    const route = card === "left" ? "/ai" : "/xiaoai-listen";
    const el = targetRef.current;
    const overlay = overlayRef.current;
    if (!el || !overlay) {
      router.push(route);
      return;
    }

    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const maxRadius = Math.max(
      Math.hypot(cx, cy),
      Math.hypot(window.innerWidth - cx, cy),
      Math.hypot(cx, window.innerHeight - cy),
      Math.hypot(window.innerWidth - cx, window.innerHeight - cy),
    );

    gsap.set(overlay, {
      display: "block",
      clipPath: `circle(0px at ${cx}px ${cy}px)`,
      backgroundColor: card === "left" ? "#1e1b4b" : "#2d2000",
    });

    gsap.to(overlay, {
      clipPath: `circle(${maxRadius}px at ${cx}px ${cy}px)`,
      duration: 0.6,
      ease: "power2.inOut",
      onComplete: () => {
        router.push(route);
      },
    });
  }, [animating, router]);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-12 overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-purple-500/5 blur-3xl portal-wave" />
        <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-blue-500/5 blur-3xl portal-wave-reverse" />
        <div className="absolute top-1/2 left-2/3 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-amber-500/5 blur-3xl portal-wave-reverse" />
      </div>

      {/* Central wave divider */}
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-purple-400/40 to-transparent portal-divider" />
      <div className="absolute left-1/2 top-0 bottom-0 w-1 -translate-x-1/2 bg-gradient-to-b from-transparent via-amber-400/20 to-transparent blur-sm portal-divider-reverse" />

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {particles.map((p, i) => (
          <span
            key={i}
            className="portal-particle"
            style={{
              left: p.left,
              top: p.top,
              animationDelay: p.delay,
              animationDuration: p.duration,
              width: p.width,
              height: p.height,
            }}
          />
        ))}
      </div>

      {/* Title */}
      <div className="relative z-10 text-center mb-12 md:mb-16">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-1.5 text-sm text-cosmic-muted border border-white/10">
          <Sparkles className="size-4 text-cosmic-gold" />
          小爱心理倾诉
        </div>
        <h1 className="cosmic-gradient-text text-4xl font-extrabold md:text-5xl lg:text-6xl">
          选择你的倾诉方式
        </h1>
        <p className="mx-auto mt-4 max-w-md text-cosmic-muted text-sm md:text-base">
          无论是文字还是声音，小爱都在这里，用心倾听你的每一个瞬间
        </p>
      </div>

      {/* Dual cards */}
      <div className="relative z-10 flex flex-col md:flex-row items-center gap-4 md:gap-0 w-full max-w-4xl">
        {/* Left card — 文字倾诉咨询 */}
        <button
          ref={leftRef}
          type="button"
          onClick={() => handleEnter("left")}
          onMouseEnter={() => setHovered("left")}
          onMouseLeave={() => setHovered(null)}
          className={`portal-card portal-card-left group relative flex-1 w-full md:w-auto p-8 md:p-10 rounded-2xl text-left transition-all duration-500 cursor-pointer ${
            hovered === "right" ? "md:opacity-60" : ""
          }`}
        >
          {/* Card glow */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className={`absolute inset-0 rounded-2xl ring-1 ring-white/10 transition-all duration-500 ${
            hovered === "left" ? "ring-purple-400/40 shadow-lg shadow-purple-500/10" : ""
          }`} />

          <div className="relative z-10">
            <div className="mb-6 inline-flex size-14 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-400 group-hover:scale-110 transition-transform duration-500">
              <MessageCircle className="size-7" />
            </div>
            <h2 className="mb-3 text-2xl font-bold text-white md:text-3xl">文字倾诉咨询</h2>
            <p className="mb-6 text-sm text-cosmic-muted leading-relaxed max-w-xs">
              与 AI 心理咨询师进行深度文字对话，随时随地倾诉内心的烦恼与困惑，获得专业的情绪疏导
            </p>
            <span className={`inline-flex items-center gap-2 text-sm font-medium transition-all duration-500 ${
              hovered === "left" ? "text-indigo-400 translate-x-1" : "text-cosmic-dim"
            }`}>
              开始倾诉
              <ArrowRight className="size-4" />
            </span>
          </div>

          {/* Card particles */}
          {hovered === "left" && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
              {Array.from({ length: 6 }).map((_, i) => (
                <span
                  key={i}
                  className="portal-card-particle"
                  style={{
                    left: `${20 + Math.random() * 60}%`,
                    top: `${20 + Math.random() * 60}%`,
                    animationDelay: `${Math.random() * 2}s`,
                    backgroundColor: "#818cf8",
                  }}
                />
              ))}
            </div>
          )}
        </button>

        {/* Central overlap zone */}
        <div className="relative z-20 flex-shrink-0 w-16 h-16 md:w-12 md:h-auto md:absolute md:left-1/2 md:-translate-x-1/2 md:top-0 md:bottom-0 flex items-center justify-center">
          <div className={`size-10 rounded-full border border-white/10 bg-black/40 flex items-center justify-center transition-all duration-700 ${
            hovered ? "border-white/30 shadow-lg shadow-white/10 scale-110" : ""
          }`}>
            <Sparkles className={`size-4 transition-colors duration-500 ${
              hovered === "left" ? "text-indigo-400" : hovered === "right" ? "text-amber-400" : "text-cosmic-dim"
            }`} />
          </div>
        </div>

        {/* Right card — 视听倾听陪伴 */}
        <button
          ref={rightRef}
          type="button"
          onClick={() => handleEnter("right")}
          onMouseEnter={() => setHovered("right")}
          onMouseLeave={() => setHovered(null)}
          className={`portal-card portal-card-right group relative flex-1 w-full md:w-auto p-8 md:p-10 rounded-2xl text-left transition-all duration-500 cursor-pointer ${
            hovered === "left" ? "md:opacity-60" : ""
          }`}
        >
          {/* Card glow */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-bl from-amber-500/10 via-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className={`absolute inset-0 rounded-2xl ring-1 ring-white/10 transition-all duration-500 ${
            hovered === "right" ? "ring-amber-400/40 shadow-lg shadow-amber-500/10" : ""
          }`} />

          <div className="relative z-10">
            <div className="mb-6 inline-flex size-14 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 group-hover:scale-110 transition-transform duration-500">
              <Headphones className="size-7" />
            </div>
            <h2 className="mb-3 text-2xl font-bold text-white md:text-3xl">视听倾听陪伴</h2>
            <p className="mb-6 text-sm text-cosmic-muted leading-relaxed max-w-xs">
              与 AI 倾听伙伴进行语音和视频实时对话，沉浸式的陪伴体验，如同与朋友面对面交流
            </p>
            <span className={`inline-flex items-center gap-2 text-sm font-medium transition-all duration-500 ${
              hovered === "right" ? "text-amber-400 translate-x-1" : "text-cosmic-dim"
            }`}>
              开始陪伴
              <ArrowRight className="size-4" />
            </span>
          </div>

          {/* Card particles */}
          {hovered === "right" && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
              {Array.from({ length: 6 }).map((_, i) => (
                <span
                  key={i}
                  className="portal-card-particle"
                  style={{
                    left: `${20 + Math.random() * 60}%`,
                    top: `${20 + Math.random() * 60}%`,
                    animationDelay: `${Math.random() * 2}s`,
                    backgroundColor: "#fbbf24",
                  }}
                />
              ))}
            </div>
          )}
        </button>
      </div>

      {/* GSAP overlay for click transition */}
      <div
        ref={overlayRef}
        className="fixed inset-0 z-50 hidden pointer-events-none"
        style={{ clipPath: "circle(0px at 50% 50%)" }}
      />
    </div>
  );
}
