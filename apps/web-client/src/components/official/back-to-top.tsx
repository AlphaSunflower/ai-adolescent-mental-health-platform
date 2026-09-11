"use client";

import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";

const SHOW_AFTER = 480;

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let frameId = 0;
    let lastScrollY = window.scrollY;
    let lastCheck = 0;

    const checkDirection = (time: number) => {
      if (time - lastCheck >= 80) {
        const currentScrollY = window.scrollY;
        const delta = currentScrollY - lastScrollY;
        const shouldShow =
          currentScrollY > SHOW_AFTER && delta < -2;
        const shouldHide =
          currentScrollY <= SHOW_AFTER || delta > 3;

        if (shouldShow) setVisible(true);
        if (shouldHide) setVisible(false);

        lastScrollY = currentScrollY;
        lastCheck = time;
      }

      frameId = window.requestAnimationFrame(checkDirection);
    };

    frameId = window.requestAnimationFrame(checkDirection);
    return () => window.cancelAnimationFrame(frameId);
  }, []);

  const scrollToTop = () => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    window.scrollTo({
      top: 0,
      behavior: reducedMotion ? "auto" : "smooth",
    });
  };

  return (
    <button
      type="button"
      aria-label="返回顶部"
      title="返回顶部"
      className={`official-back-to-top ${visible ? "is-visible" : ""}`}
      onClick={scrollToTop}
    >
      <ArrowUp aria-hidden="true" />
    </button>
  );
}
