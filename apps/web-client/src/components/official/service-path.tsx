"use client";

import { Bot, HeartPulse, UserRoundCheck } from "lucide-react";
import { useEffect, useRef } from "react";
import AnimatedContent from "./animated-content";

const SERVICE_STEPS = [
  { label: "AI初筛测评", icon: Bot },
  { label: "持续情绪干预", icon: HeartPulse },
  { label: "专业咨询师转接", icon: UserRoundCheck },
] as const;

export default function ServicePath() {
  const signalRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const signal = signalRef.current;
    const track = signal?.parentElement;
    if (!signal || !track) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let animationFrame = 0;
    let progress = 0.2;
    let lastTime = performance.now();

    const animate = (time: number) => {
      const horizontal = window.matchMedia("(min-width: 768px)").matches;
      const length = Math.max(
        1,
        horizontal ? track.clientWidth : track.clientHeight,
      );
      const delta = Math.min(48, time - lastTime);
      const speed = reducedMotion ? 0.018 : 0.055;
      lastTime = time;
      progress += (speed * delta) / length;

      if (progress > 1) progress = 0.2;

      const distance = progress * (length + 120) - 120;
      signal.style.transform = horizontal
        ? `translate3d(${distance}px, 0, 0)`
        : `translate3d(0, ${distance}px, 0)`;
      animationFrame = window.requestAnimationFrame(animate);
    };

    animationFrame = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(animationFrame);
  }, []);

  return (
    <section className="official-service" aria-label="服务链路">
      <div className="official-service__inner">
        <AnimatedContent>
          <div className="official-service__track" aria-hidden="true">
            <span ref={signalRef} className="official-service__signal" />
          </div>
          <ol className="official-service__steps">
            {SERVICE_STEPS.map((step, index) => {
              const Icon = step.icon;
              return (
                <li key={step.label} className="official-service__step">
                  <span className="official-service__node">
                    <Icon aria-hidden="true" />
                    <i aria-hidden="true">{index + 1}</i>
                  </span>
                  <strong>{step.label}</strong>
                </li>
              );
            })}
          </ol>
        </AnimatedContent>
      </div>
    </section>
  );
}
