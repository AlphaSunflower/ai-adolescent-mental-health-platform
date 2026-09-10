"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

/**
 * 改编自 React Bits「Counter」（reactbits.dev，GSAP 实现）。
 * 进入视口时数字从 0 滚动到目标值，一次性动画；
 * prefers-reduced-motion 时直接呈现最终数字。
 */
export default function Counter({
  to,
  className,
  duration = 1.6,
}: {
  to: number;
  className?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        el.textContent = String(to);
        return;
      }
      const state = { value: 0 };
      gsap.to(state, {
        value: to,
        duration,
        ease: "power2.out",
        scrollTrigger: {
          trigger: el,
          start: "top 90%",
          once: true,
        },
        onUpdate() {
          el.textContent = String(Math.round(state.value));
        },
      });
    },
    { scope: ref, dependencies: [to, duration] },
  );

  return (
    <span ref={ref} className={className}>
      0
    </span>
  );
}
