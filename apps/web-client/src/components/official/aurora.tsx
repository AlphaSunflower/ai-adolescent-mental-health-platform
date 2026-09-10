"use client";

import { useEffect, useRef } from "react";
import { Color, Mesh, Program, Renderer, Triangle } from "ogl";

/**
 * 改编自 React Bits「Aurora」（reactbits.dev，ogl 着色器实现）。
 * Hero 背景流体光斑：低饱和紫蓝三 stop、低透明度，贴合方案 B 柔和感。
 * prefers-reduced-motion 时只渲染静态首帧，不启动动画循环。
 */

const VERT = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAG = `#version 300 es
precision highp float;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;

out vec4 fragColor;

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution.xy;
  float t = uTime * 0.09;

  float wave1 = sin(uv.x * 3.1 + t + sin(uv.y * 2.2 + t * 1.3) * 1.2);
  float wave2 = sin(uv.x * 5.3 - t * 0.7 + uv.y * 3.4 + 1.7);
  float wave3 = sin(uv.x * 2.2 + t * 0.5 - uv.y * 1.6 + 4.2);

  float falloff = 1.0 - uv.y;
  float m1 = smoothstep(0.25, 1.0, wave1 * 0.5 + 0.5) * falloff;
  float m2 = smoothstep(0.45, 1.0, wave2 * 0.5 + 0.5) * falloff * 0.7;
  float m3 = smoothstep(0.35, 1.0, wave3 * 0.5 + 0.5) * falloff * 0.5;

  vec3 color = uColor1 * m1 + uColor2 * m2 + uColor3 * m3;
  float alpha = clamp(m1 * 0.75 + m2 * 0.6 + m3 * 0.45, 0.0, 1.0) * 0.55;

  fragColor = vec4(color, alpha);
}
`;

export default function Aurora({
  className = "",
  colorStops = ["#E9E3FA", "#DDE7FA", "#D8D2EC"],
}: {
  className?: string;
  colorStops?: [string, string, string] | string[];
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const renderer = new Renderer({ alpha: true, antialias: true, dpr: Math.min(window.devicePixelRatio, 2) });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.canvas.style.width = "100%";
    gl.canvas.style.height = "100%";
    container.appendChild(gl.canvas);

    const geometry = new Triangle(gl);
    const program = new Program(gl, {
      vertex: VERT,
      fragment: FRAG,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: [1, 1] },
        uColor1: { value: new Color(colorStops[0] ?? "#E9E3FA") },
        uColor2: { value: new Color(colorStops[1] ?? "#DDE7FA") },
        uColor3: { value: new Color(colorStops[2] ?? "#D8D2EC") },
      },
    });
    const mesh = new Mesh(gl, { geometry, program });

    const resize = () => {
      const { clientWidth, clientHeight } = container;
      renderer.setSize(clientWidth, clientHeight);
      program.uniforms.uResolution.value = [gl.drawingBufferWidth, gl.drawingBufferHeight];
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(container);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let rafId = 0;
    const render = (time: number) => {
      program.uniforms.uTime.value = time / 1000;
      renderer.render({ scene: mesh });
    };
    if (reduced) {
      render(12000); // 静态首帧：取一个相位舒展的时刻
    } else {
      const loop = (time: number) => {
        render(time);
        rafId = requestAnimationFrame(loop);
      };
      rafId = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      gl.canvas.remove();
    };
  }, [colorStops]);

  return <div ref={containerRef} aria-hidden="true" className={`official-aurora ${className}`} />;
}
