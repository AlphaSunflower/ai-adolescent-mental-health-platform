"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";

/**
 * 改编自 React Bits「BlurText」（reactbits.dev，GSAP 实现）。
 * 逐词（无空格文本逐字）模糊浮现入场，一次性动画；
 * prefers-reduced-motion 时直接呈现完整文本。
 */
export default function BlurText({
  text,
  className,
  delay = 0,
  duration = 0.8,
  ease = "power3.out",
  stagger = 0.08,
}: {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  ease?: string;
  stagger?: number;
}) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const segments = text.includes(" ") ? text.split(/(\s+)/) : Array.from(text);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      if (!containerRef.current) return;
      gsap.from(containerRef.current.querySelectorAll("[data-blur-segment]"), {
        opacity: 0,
        y: 18,
        filter: "blur(10px)",
        ease,
        duration,
        delay,
        stagger,
        onComplete() {
          // 动画结束后清除 inline filter，避免残留合成层
          gsap.set(this.targets(), { clearProps: "filter,transform,opacity" });
        },
      });
    },
    { scope: containerRef, dependencies: [text, delay, duration, ease, stagger] },
  );

  return (
    <span ref={containerRef} className={className}>
      {segments.map((segment, index) =>
        /^\s+$/.test(segment) ? (
          segment
        ) : (
          <span key={index} data-blur-segment className="inline-block will-change-transform">
            {segment}
          </span>
        ),
      )}
    </span>
  );
}
