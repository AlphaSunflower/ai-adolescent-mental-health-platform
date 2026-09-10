"use client";

import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  originX: number;
  originY: number;
  vx: number;
  vy: number;
  radius: number;
  phase: number;
  cluster: number;
};

type Ripple = {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  life: number;
};

const PARTICLE_COLORS = [
  "rgba(111, 100, 168, 0.82)",
  "rgba(139, 124, 200, 0.72)",
  "rgba(74, 173, 165, 0.64)",
  "rgba(222, 145, 194, 0.58)",
];

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export default function MindConstellation({
  className = "",
}: {
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const interactionTarget = container.parentElement ?? container;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let animationFrame = 0;
    let particles: Particle[] = [];
    const pointer = { x: 0, y: 0, active: false };
    const ripples: Ripple[] = [];
    const motionScale = reducedMotion ? 0.46 : 1;
    const timeScale = reducedMotion ? 0.58 : 1;

    const createParticles = () => {
      const count = width < 640 ? 34 : width < 1024 ? 48 : 64;
      particles = Array.from({ length: count }, (_, index) => {
        const x = Math.random() * width;
        const y = Math.random() * height;
        return {
          x,
          y,
          originX: x,
          originY: y,
          vx: (Math.random() - 0.5) * 0.24,
          vy: (Math.random() - 0.5) * 0.24,
          radius: 1.2 + Math.random() * 1.8,
          phase: Math.random() * Math.PI * 2,
          cluster: index % 3,
        };
      });
    };

    const resize = () => {
      const rect = container.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      createParticles();
    };

    const draw = (time: number) => {
      ctx.clearRect(0, 0, width, height);

      const scanX =
        (((time * 0.001 * timeScale * 0.075) % (width + 360)) - 180) || 0;
      const scanGradient = ctx.createLinearGradient(
        scanX - 170,
        0,
        scanX + 170,
        0,
      );
      scanGradient.addColorStop(0, "rgba(111, 100, 168, 0)");
      scanGradient.addColorStop(0.48, "rgba(123, 109, 222, 0.045)");
      scanGradient.addColorStop(0.52, "rgba(74, 173, 165, 0.035)");
      scanGradient.addColorStop(1, "rgba(111, 100, 168, 0)");
      ctx.fillStyle = scanGradient;
      ctx.fillRect(scanX - 170, 0, 340, height);

      const heroRect = interactionTarget.getBoundingClientRect();
      const scrollProgress = clamp(-heroRect.top / (height * 0.72), 0, 1);
      const clusterY = height * 0.52;
      const clusterCenters = [
        width * 0.24,
        width * 0.5,
        width * 0.76,
      ];

      for (const particle of particles) {
        const elapsed = time * 0.001 * timeScale;
        const driftX =
          (Math.sin(elapsed * 0.52 + particle.phase) * 34 +
            Math.sin(elapsed * 0.19 + particle.phase * 1.7) * 14) *
          motionScale;
        const driftY =
          (Math.cos(elapsed * 0.46 + particle.phase * 1.25) * 26 +
            Math.cos(elapsed * 0.23 + particle.phase * 0.8) * 11) *
          motionScale;
        const targetX = particle.originX + driftX;
        const targetY = particle.originY + driftY;

        particle.x += particle.vx * motionScale;
        particle.y += particle.vy * motionScale;

        if (pointer.active) {
          const dx = pointer.x - particle.x;
          const dy = pointer.y - particle.y;
          const distance = Math.hypot(dx, dy);
          if (distance > 0 && distance < 190) {
            const force = (1 - distance / 190) * 0.06 * motionScale;
            particle.vx += (dx / distance) * force;
            particle.vy += (dy / distance) * force;
          }
        }

        const clusterTargetX =
          clusterCenters[particle.cluster] +
          (particle.originX - clusterCenters[particle.cluster]) * 0.18;
        const clusterTargetY =
          clusterY + (particle.originY - clusterY) * 0.16;
        particle.vx +=
          (targetX - particle.x) * 0.00115 +
          (clusterTargetX - particle.x) *
            0.0026 *
            scrollProgress *
            motionScale;
        particle.vy +=
          (targetY - particle.y) * 0.00115 +
          (clusterTargetY - particle.y) *
            0.0026 *
            scrollProgress *
            motionScale;

        particle.vx *= 0.994;
        particle.vy *= 0.994;

        if (particle.x < -20) particle.x = width + 20;
        if (particle.x > width + 20) particle.x = -20;
        if (particle.y < -20) particle.y = height + 20;
        if (particle.y > height + 20) particle.y = -20;
      }

      for (let index = 0; index < particles.length; index += 1) {
        const particle = particles[index];
        for (
          let nextIndex = index + 1;
          nextIndex < particles.length;
          nextIndex += 1
        ) {
          const next = particles[nextIndex];
          const dx = next.x - particle.x;
          const dy = next.y - particle.y;
          const distance = Math.hypot(dx, dy);
          const connectionDistance = scrollProgress > 0.45 ? 118 : 138;
          if (distance >= connectionDistance) continue;

          const alpha =
            (1 - distance / connectionDistance) *
            (0.18 + scrollProgress * 0.14) *
            (0.76 +
              Math.sin(time * 0.0011 + particle.phase + next.phase) * 0.24);
          ctx.beginPath();
          ctx.moveTo(particle.x, particle.y);
          ctx.lineTo(next.x, next.y);
          ctx.strokeStyle = `rgba(111, 100, 168, ${alpha})`;
          ctx.lineWidth = particle.cluster === next.cluster ? 0.9 : 0.55;
          ctx.stroke();
        }
      }

      if (pointer.active) {
        for (const particle of particles) {
          const dx = pointer.x - particle.x;
          const dy = pointer.y - particle.y;
          const distance = Math.hypot(dx, dy);
          if (distance >= 180) continue;
          ctx.beginPath();
          ctx.moveTo(pointer.x, pointer.y);
          ctx.lineTo(particle.x, particle.y);
          ctx.strokeStyle = `rgba(111, 100, 168, ${
            (1 - distance / 180) * 0.34
          })`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      for (const particle of particles) {
        const pulse = reducedMotion
          ? 1
          : 0.82 + Math.sin(time * 0.0012 + particle.phase) * 0.18;
        const radius = particle.radius * pulse;
        const color =
          PARTICLE_COLORS[
            (particle.cluster + Math.floor(particle.phase)) %
              PARTICLE_COLORS.length
          ];

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, radius * 3.4, 0, Math.PI * 2);
        ctx.fillStyle = color.replace(/[\d.]+\)$/, "0.08)");
        ctx.fill();

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      }

      if (!reducedMotion) {
        for (let index = ripples.length - 1; index >= 0; index -= 1) {
          const ripple = ripples[index];
          ripple.radius += (ripple.maxRadius - ripple.radius) * 0.06;
          ripple.life += 1;
          const alpha = Math.max(0, 1 - ripple.life / 68);
          ctx.beginPath();
          ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(111, 100, 168, ${alpha * 0.42})`;
          ctx.lineWidth = 1.2;
          ctx.stroke();
          if (ripple.life >= 68) ripples.splice(index, 1);
        }
      }
    };

    const animate = (time: number) => {
      draw(time);
      animationFrame = window.requestAnimationFrame(animate);
    };

    const handlePointerMove = (event: PointerEvent) => {
      const rect = interactionTarget.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      pointer.active = true;
    };

    const handlePointerLeave = () => {
      pointer.active = false;
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (reducedMotion) return;
      const rect = interactionTarget.getBoundingClientRect();
      ripples.push({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
        radius: 4,
        maxRadius: 92,
        life: 0,
      });
    };

    const observer = new ResizeObserver(resize);
    observer.observe(container);
    interactionTarget.addEventListener("pointermove", handlePointerMove);
    interactionTarget.addEventListener("pointerleave", handlePointerLeave);
    interactionTarget.addEventListener("pointerdown", handlePointerDown);
    resize();

    animationFrame = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      observer.disconnect();
      interactionTarget.removeEventListener("pointermove", handlePointerMove);
      interactionTarget.removeEventListener("pointerleave", handlePointerLeave);
      interactionTarget.removeEventListener("pointerdown", handlePointerDown);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={`official-constellation ${className}`}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
