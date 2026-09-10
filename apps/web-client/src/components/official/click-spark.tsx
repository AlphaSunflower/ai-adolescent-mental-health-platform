"use client";

import gsap from "gsap";
import { useCallback, useEffect, useRef, type MouseEvent, type ReactNode } from "react";

/**
 * 改编自 React Bits「ClickSpark」（reactbits.dev，canvas + GSAP ticker 实现）。
 * 点击时从触点迸发放射状小火花，仅点击反馈场景出现；
 * prefers-reduced-motion 时不产生火花。
 */

type Spark = {
  x: number;
  y: number;
  angle: number;
  speed: number;
  life: number;
  maxLife: number;
  length: number;
  color: string;
};

const SPARK_COLORS = ["#8B7CC8", "#B9AEE4", "#FFFFFF"];
const SPARK_COUNT = 8;
const PADDING = 24; // 与 official.css 中 canvas 的 inset 对应

export default function ClickSpark({ children }: { children: ReactNode }) {
  const wrapRef = useRef<HTMLSpanElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sparksRef = useRef<Spark[]>([]);
  const runningRef = useRef(false);

  const resize = useCallback(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = wrap.getBoundingClientRect();
    canvas.width = (rect.width + PADDING * 2) * dpr;
    canvas.height = (rect.height + PADDING * 2) * dpr;
    const ctx = canvas.getContext("2d");
    ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
  }, []);

  useEffect(() => {
    resize();
    const observer = new ResizeObserver(resize);
    if (wrapRef.current) observer.observe(wrapRef.current);
    return () => observer.disconnect();
  }, [resize]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) {
      runningRef.current = false;
      return;
    }
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

    sparksRef.current = sparksRef.current.filter((spark) => {
      spark.life += 1;
      const progress = spark.life / spark.maxLife;
      if (progress >= 1) return false;
      const distance = spark.speed * (1 - Math.pow(1 - progress, 2)); // ease-out 位移
      const x = spark.x + Math.cos(spark.angle) * distance;
      const y = spark.y + Math.sin(spark.angle) * distance;
      const tail = spark.length * (1 - progress);
      ctx.strokeStyle = spark.color;
      ctx.globalAlpha = 1 - progress;
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(x - Math.cos(spark.angle) * tail, y - Math.sin(spark.angle) * tail);
      ctx.lineTo(x, y);
      ctx.stroke();
      return true;
    });
    ctx.globalAlpha = 1;

    if (sparksRef.current.length === 0) {
      runningRef.current = false;
      gsap.ticker.remove(draw);
    }
  }, []);

  const handleClick = (e: MouseEvent<HTMLSpanElement>) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const wrap = wrapRef.current;
    if (!wrap) return;
    const rect = wrap.getBoundingClientRect();
    const x = e.clientX - rect.left + PADDING;
    const y = e.clientY - rect.top + PADDING;
    for (let i = 0; i < SPARK_COUNT; i += 1) {
      sparksRef.current.push({
        x,
        y,
        angle: (Math.PI * 2 * i) / SPARK_COUNT + Math.random() * 0.4,
        speed: 26 + Math.random() * 18,
        life: 0,
        maxLife: 22 + Math.random() * 8,
        length: 8 + Math.random() * 6,
        color: SPARK_COLORS[i % SPARK_COLORS.length],
      });
    }
    if (!runningRef.current) {
      runningRef.current = true;
      gsap.ticker.add(draw);
    }
  };

  return (
    <span ref={wrapRef} className="official-click-spark" onClick={handleClick}>
      <canvas ref={canvasRef} aria-hidden="true" />
      {children}
    </span>
  );
}
