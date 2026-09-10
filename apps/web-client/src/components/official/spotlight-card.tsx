"use client";

import { useRef, type CSSProperties, type MouseEvent, type ReactNode } from "react";

/**
 * 改编自 React Bits「SpotlightCard」（reactbits.dev）：
 * 鼠标跟随聚光卡片。聚光仅在 hover 时显现，无自主运动。
 */
export default function SpotlightCard({
  children,
  className = "",
  spotlightColor = "rgba(201, 168, 255, 0.22)",
}: {
  children: ReactNode;
  className?: string;
  spotlightColor?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--spotlight-x", `${e.clientX - rect.left}px`);
    el.style.setProperty("--spotlight-y", `${e.clientY - rect.top}px`);
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      className={`official-spotlight-card ${className}`}
      style={{ "--spotlight-color": spotlightColor } as CSSProperties}
    >
      {children}
    </div>
  );
}
