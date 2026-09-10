"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef, type ReactNode } from "react";

gsap.registerPlugin(ScrollTrigger);

/**
 * 改编自 React Bits「AnimatedContent」（reactbits.dev，GSAP ScrollTrigger 实现）。
 * 进入视口时上浮渐显，一次性动画；用 delay 做板块内错落（stagger 0.1s）。
 * prefers-reduced-motion 时直接呈现最终态。
 */
export default function AnimatedContent({
  children,
  className,
  delay = 0,
  distance = 28,
  duration = 0.8,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  distance?: number;
  duration?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      if (!ref.current) return;
      gsap.from(ref.current, {
        y: distance,
        opacity: 0,
        duration,
        delay,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ref.current,
          start: "top 88%",
          once: true,
        },
      });
    },
    { scope: ref, dependencies: [delay, distance, duration] },
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
