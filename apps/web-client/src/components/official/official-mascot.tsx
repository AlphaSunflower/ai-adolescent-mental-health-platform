"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const ModelViewer = dynamic(() => import("./model-viewer"), {
  ssr: false,
  loading: () => (
    <div className="official-mascot__loading" role="status" aria-live="polite">
      <span className="official-model-loader__spinner" aria-hidden="true" />
      <span>正在准备陪伴形象</span>
    </div>
  ),
});

const MASCOT_MODEL_URL = "/models/_baby.c4f3e2a2.glb";

export default function OfficialMascot() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [reducedMotion] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (!("IntersectionObserver" in window)) {
      setShouldLoad(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setShouldLoad(true);
        observer.disconnect();
      },
      { rootMargin: "320px 0px" },
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="official-mascot"
      role="group"
      aria-label="3D 陪伴形象"
    >
      <span className="official-mascot__halo" aria-hidden="true" />
      <div className="official-mascot__canvas">
        {shouldLoad ? (
          <ModelViewer
            url={MASCOT_MODEL_URL}
            width="100%"
            height="100%"
            modelYOffset={0.03}
            defaultRotationX={-5}
            defaultRotationY={12}
            defaultZoom={1.8}
            minZoomDistance={1.55}
            maxZoomDistance={3.2}
            enableMouseParallax={!reducedMotion}
            enableHoverRotation={!reducedMotion}
            enableManualRotation
            enableManualZoom
            ambientIntensity={0.7}
            keyLightIntensity={1.45}
            fillLightIntensity={0.7}
            rimLightIntensity={0.85}
            environmentPreset="none"
            fadeIn
            autoRotate={!reducedMotion}
            autoRotateSpeed={0.13}
            showScreenshotButton={false}
          />
        ) : (
          <div
            className="official-mascot__loading"
            role="status"
            aria-live="polite"
          >
            <span
              className="official-model-loader__spinner"
              aria-hidden="true"
            />
            <span>正在准备陪伴形象</span>
          </div>
        )}
      </div>
    </div>
  );
}
