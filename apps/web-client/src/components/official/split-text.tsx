"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { SplitText as GSAPSplitText } from "gsap/SplitText";
import { useRef } from "react";

gsap.registerPlugin(GSAPSplitText);

/**
 * 改编自 React Bits「SplitText」（reactbits.dev，GSAP SplitText 插件实现）。
 * 字符逐个入场，一次性动画；prefers-reduced-motion 时直接呈现完整文本。
 */
export default function SplitText({
  text,
  className,
  delay = 0,
  duration = 0.9,
  ease = "power3.out",
  stagger = 0.07,
}: {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  ease?: string;
  stagger?: number;
}) {
  const containerRef = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      if (!containerRef.current) return;
      const split = GSAPSplitText.create(containerRef.current, { type: "chars" });
      gsap.from(split.chars, {
        y: 26,
        opacity: 0,
        rotationX: -55,
        ease,
        duration,
        delay,
        stagger,
      });
      return () => split.revert();
    },
    { scope: containerRef, dependencies: [text, delay, duration, ease, stagger] },
  );

  return (
    <span ref={containerRef} className={className}>
      {text}
    </span>
  );
}
