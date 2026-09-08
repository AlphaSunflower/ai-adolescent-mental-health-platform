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
      backgroundColor: card === "left" ? "#c9a8ff" : "#ffe58a",
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
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-purple/10 blur-3xl portal-wave" />
        <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-blue/10 blur-3xl portal-wave-reverse" />
        <div className="absolute top-1/2 left-2/3 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-yellow/10 blur-3xl portal-wave-reverse" />
      </div>

      {/* Central wave divider */}
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-purple/50 to-transparent portal-divider" />
      <div className="absolute left-1/2 top-0 bottom-0 w-1 -translate-x-1/2 bg-gradient-to-b from-transparent via-yellow/30 to-transparent blur-sm portal-divider-reverse" />

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
        <div className="mb-4 inline-flex items-center gap-2 rounded-pill bg-purple/10 px-4 py-1.5 text-sm font-bold text-muted border border-[rgba(201,168,255,0.3)]">
          <Sparkles className="size-4 text-yellow" />
          小爱心理倾诉
        </div>
        <h1 className="text-4xl font-black text-ink md:text-5xl lg:text-6xl">
          选择你的倾诉方式
        </h1>
        <p className="mx-auto mt-4 max-w-md text-muted text-sm md:text-base">
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
          className={`portal-card portal-card-left group relative flex-1 w-full md:w-auto p-8 md:p-10 rounded-card bg-surface/85 cushion-card text-left transition-all duration-500 cursor-pointer ${
            hovered === "right" ? "md:opacity-60" : ""
          }`}
        >
          {/* Card glow */}
          <div className="absolute inset-0 rounded-card bg-gradient-to-br from-purple/20 via-purple/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className={`absolute inset-0 rounded-card ring-1 ring-[rgba(201,168,255,0.3)] transition-all duration-500 ${
            hovered === "left" ? "ring-purple/50 shadow-lg shadow-purple/20" : ""
          }`} />

          <div className="relative z-10">
            <div className="mb-6 inline-flex size-14 items-center justify-center rounded-control bg-purple/20 text-purple group-hover:scale-110 transition-transform duration-500">
              <MessageCircle className="size-7" />
            </div>
            <h2 className="mb-3 text-2xl font-bold text-ink md:text-3xl">文字倾诉咨询</h2>
            <p className="mb-6 text-sm text-muted leading-relaxed max-w-xs">
              与 AI 心理咨询师进行深度文字对话，随时随地倾诉内心的烦恼与困惑，获得专业的情绪疏导
            </p>
            <span className={`inline-flex items-center gap-2 text-sm font-bold transition-all duration-500 ${
              hovered === "left" ? "text-purple translate-x-1" : "text-muted/70"
            }`}>
              开始倾诉
              <ArrowRight className="size-4" />
            </span>
          </div>

          {/* Card particles */}
          {hovered === "left" && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-card">
              {Array.from({ length: 6 }).map((_, i) => (
                <span
                  key={i}
                  className="portal-card-particle"
                  style={{
                    left: `${20 + Math.random() * 60}%`,
                    top: `${20 + Math.random() * 60}%`,
                    animationDelay: `${Math.random() * 2}s`,
                    backgroundColor: "#c9a8ff",
                  }}
                />
              ))}
            </div>
          )}
        </button>

        {/* Central overlap zone */}
        <div className="relative z-20 flex-shrink-0 w-16 h-16 md:w-12 md:h-auto md:absolute md:left-1/2 md:-translate-x-1/2 md:top-0 md:bottom-0 flex items-center justify-center">
          <div className={`size-10 rounded-full border border-[rgba(201,168,255,0.3)] bg-purple/20 flex items-center justify-center transition-all duration-700 ${
            hovered ? "border-purple/50 shadow-lg shadow-purple/20 scale-110" : ""
          }`}>
            <Sparkles className={`size-4 transition-colors duration-500 ${
              hovered === "left" ? "text-purple" : hovered === "right" ? "text-yellow" : "text-muted/70"
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
          className={`portal-card portal-card-right group relative flex-1 w-full md:w-auto p-8 md:p-10 rounded-card bg-surface/85 cushion-card text-left transition-all duration-500 cursor-pointer ${
            hovered === "left" ? "md:opacity-60" : ""
          }`}
        >
          {/* Card glow */}
          <div className="absolute inset-0 rounded-card bg-gradient-to-bl from-yellow/20 via-orange/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className={`absolute inset-0 rounded-card ring-1 ring-[rgba(201,168,255,0.3)] transition-all duration-500 ${
            hovered === "right" ? "ring-yellow/50 shadow-lg shadow-yellow/20" : ""
          }`} />

          <div className="relative z-10">
            <div className="mb-6 inline-flex size-14 items-center justify-center rounded-control bg-yellow/20 text-yellow group-hover:scale-110 transition-transform duration-500">
              <Headphones className="size-7" />
            </div>
            <h2 className="mb-3 text-2xl font-bold text-ink md:text-3xl">视听倾听陪伴</h2>
            <p className="mb-6 text-sm text-muted leading-relaxed max-w-xs">
              与 AI 倾听伙伴进行语音和视频实时对话，沉浸式的陪伴体验，如同与朋友面对面交流
            </p>
            <span className={`inline-flex items-center gap-2 text-sm font-bold transition-all duration-500 ${
              hovered === "right" ? "text-yellow translate-x-1" : "text-muted/70"
            }`}>
              开始陪伴
              <ArrowRight className="size-4" />
            </span>
          </div>

          {/* Card particles */}
          {hovered === "right" && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-card">
              {Array.from({ length: 6 }).map((_, i) => (
                <span
                  key={i}
                  className="portal-card-particle"
                  style={{
                    left: `${20 + Math.random() * 60}%`,
                    top: `${20 + Math.random() * 60}%`,
                    animationDelay: `${Math.random() * 2}s`,
                    backgroundColor: "#ffe58a",
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
