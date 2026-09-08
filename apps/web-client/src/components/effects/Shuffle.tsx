"use client";

import { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(SplitText);

interface ShuffleProps {
  text: string;
  tag?: string;
  className?: string;
  style?: React.CSSProperties;
  shuffleDirection?: "left" | "right" | "up" | "down";
  duration?: number;
  ease?: string;
  stagger?: number;
  shuffleTimes?: number;
  animationMode?: "random" | "evenodd";
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
  triggerOnHover?: boolean;
  respectReducedMotion?: boolean;
  textAlign?: React.CSSProperties["textAlign"];
  onShuffleComplete?: () => void;
  loop?: boolean;
  loopDelay?: number;
  maxDelay?: number;
  scrambleCharset?: string;
  colorFrom?: string;
  colorTo?: string;
}

export default function Shuffle({
  text,
  tag: Tag = "p",
  className = "",
  style = {},
  duration = 0.35,
  ease = "power3.out",
  stagger = 0.05,
  respectReducedMotion = true,
  textAlign = "center",
  triggerOnHover = true,
  onShuffleComplete,
}: ShuffleProps) {
  const ref = useRef<HTMLElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!ref.current || !text) return;

    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduce) {
      setReady(true);
      onShuffleComplete?.();
      return;
    }

    const el = ref.current;
    let split: SplitText | null = null;
    let tl: gsap.core.Timeline | null = null;

    // Wait 2 frames so the browser has fully laid out the element
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        split = new SplitText(el, { type: "chars" });
        const chars = split.chars as HTMLElement[];
        if (!chars.length) {
          setReady(true);
          return;
        }

        gsap.set(chars, { opacity: 0, x: 20 });

        tl = gsap.timeline({
          onComplete: () => {
            try {
              split?.revert();
            } catch {}
            split = null;
            onShuffleComplete?.();
          },
        });

        tl.to(chars, {
          opacity: 1,
          x: 0,
          duration,
          ease,
          stagger,
        });

        setReady(true);
      });
    });

    const onHover = () => {
      if (!ref.current) return;
      try {
        split?.revert();
      } catch {}
      split = new SplitText(el, { type: "chars" });
      const chars = split.chars as HTMLElement[];
      if (!chars.length) return;
      gsap.set(chars, { opacity: 0, x: 20 });
      tl?.kill();
      tl = gsap.timeline({
        onComplete: () => {
          try {
            split?.revert();
          } catch {}
          split = null;
        },
      });
      tl.to(chars, { opacity: 1, x: 0, duration, ease, stagger });
    };

    if (triggerOnHover) el.addEventListener("mouseenter", onHover);

    return () => {
      cancelAnimationFrame(raf);
      tl?.kill();
      try {
        split?.revert();
      } catch {}
      if (triggerOnHover) el.removeEventListener("mouseenter", onHover);
    };
  }, [
    text,
    duration,
    ease,
    stagger,
    respectReducedMotion,
    triggerOnHover,
    onShuffleComplete,
  ]);

  return (
    // @ts-expect-error dynamic tag
    <Tag
      ref={ref}
      className={className}
      style={{
        ...style,
        textAlign,
        visibility: ready ? "visible" : "hidden",
        lineHeight: 1.1,
      }}
    >
      {text}
    </Tag>
  );
}
