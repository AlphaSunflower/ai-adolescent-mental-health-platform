"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

interface PeekCharactersProps {
  isTyping: boolean;
  showPassword: boolean;
  passwordLength: number;
  isFocused: boolean;
}

const SCALE = 0.6;
export const W = Math.round(550 * SCALE);
export const H = Math.round(400 * SCALE);

const EYE_BASE = {
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
  willChange: "height",
} as const;

export function PeekCharacters({ isTyping, showPassword, passwordLength, isFocused }: PeekCharactersProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const purpleRef = useRef<HTMLDivElement>(null);
  const blackRef = useRef<HTMLDivElement>(null);
  const orangeRef = useRef<HTMLDivElement>(null);
  const yellowRef = useRef<HTMLDivElement>(null);
  const purpleFaceRef = useRef<HTMLDivElement>(null);
  const blackFaceRef = useRef<HTMLDivElement>(null);
  const orangeFaceRef = useRef<HTMLDivElement>(null);
  const yellowFaceRef = useRef<HTMLDivElement>(null);
  const yellowMouthRef = useRef<HTMLDivElement>(null);

  const mouseRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef(0);
  const qtRef = useRef<Record<string, gsap.QuickToFunc> | null>(null);
  const stateRef = useRef({ isTyping, showPassword, passwordLength, isFocused, isLooking: false });
  const blinkTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const lookTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Keep stateRef in sync with props
  stateRef.current = { ...stateRef.current, isTyping, showPassword, passwordLength, isFocused };

  const calcPos = (el: HTMLElement) => {
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 3;
    const dx = mouseRef.current.x - cx;
    const dy = mouseRef.current.y - cy;
    return {
      faceX: Math.max(-15, Math.min(15, dx / 20)),
      faceY: Math.max(-10, Math.min(10, dy / 30)),
      bodySkew: Math.max(-6, Math.min(6, -dx / 120)),
    };
  };

  const calcEyePos = (el: HTMLElement, maxDist: number) => {
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const dx = mouseRef.current.x - cx;
    const dy = mouseRef.current.y - cy;
    const dist = Math.min(Math.sqrt(dx ** 2 + dy ** 2), maxDist);
    const angle = Math.atan2(dy, dx);
    return { x: Math.cos(angle) * dist, y: Math.sin(angle) * dist };
  };

  const applyLookAtEachOther = () => {
    const qt = qtRef.current;
    if (!qt || !purpleFaceRef.current || !blackFaceRef.current) return;
    qt.purpleFaceLeft(55 * SCALE);
    qt.purpleFaceTop(65 * SCALE);
    qt.blackFaceLeft(32 * SCALE);
    qt.blackFaceTop(12 * SCALE);
    purpleRef.current?.querySelectorAll(".eyeball-pupil").forEach((p) => {
      gsap.to(p, { x: 3, y: 4, duration: 0.3, ease: "power2.out", overwrite: "auto" });
    });
    blackRef.current?.querySelectorAll(".eyeball-pupil").forEach((p) => {
      gsap.to(p, { x: 0, y: -4, duration: 0.3, ease: "power2.out", overwrite: "auto" });
    });
  };

  const applyHidingPassword = () => {
    const qt = qtRef.current;
    if (!qt) return;
    qt.purpleFaceLeft(55 * SCALE);
    qt.purpleFaceTop(65 * SCALE);
  };

  const applyShowPassword = () => {
    const qt = qtRef.current;
    if (!qt) return;
    qt.purpleSkew(0);
    qt.blackSkew(0);
    qt.orangeSkew(0);
    qt.yellowSkew(0);
    qt.purpleX(0);
    qt.blackX(0);
    qt.purpleHeight(400 * SCALE);
    qt.purpleFaceLeft(20 * SCALE);
    qt.purpleFaceTop(35 * SCALE);
    qt.blackFaceLeft(10 * SCALE);
    qt.blackFaceTop(28 * SCALE);
    qt.orangeFaceX((50 - 82) * SCALE);
    qt.orangeFaceY((85 - 90) * SCALE);
    qt.yellowFaceX((20 - 52) * SCALE);
    qt.yellowFaceY((35 - 40) * SCALE);
    qt.mouthX((10 - 40) * SCALE);
    qt.mouthY(0);

    const pupils: gsap.TweenTarget = ".pupil, .eyeball-pupil";
    gsap.to(pupils, { x: -5, y: -4, duration: 0.3, ease: "power2.out", overwrite: "auto" });
  };

  useEffect(() => {
    const purple = purpleRef.current;
    const black = blackRef.current;
    const orange = orangeRef.current;
    const yellow = yellowRef.current;
    const purpleFace = purpleFaceRef.current;
    const blackFace = blackFaceRef.current;
    const orangeFace = orangeFaceRef.current;
    const yellowFace = yellowFaceRef.current;
    const yellowMouth = yellowMouthRef.current;
    if (!purple || !black || !orange || !yellow || !purpleFace || !blackFace || !orangeFace || !yellowFace || !yellowMouth) return;

    gsap.set(".pupil", { x: 0, y: 0 });
    gsap.set(".eyeball-pupil", { x: 0, y: 0 });

    qtRef.current = {
      purpleSkew: gsap.quickTo(purple, "skewX", { duration: 0.3, ease: "power2.out" }),
      blackSkew: gsap.quickTo(black, "skewX", { duration: 0.3, ease: "power2.out" }),
      orangeSkew: gsap.quickTo(orange, "skewX", { duration: 0.3, ease: "power2.out" }),
      yellowSkew: gsap.quickTo(yellow, "skewX", { duration: 0.3, ease: "power2.out" }),
      purpleX: gsap.quickTo(purple, "x", { duration: 0.3, ease: "power2.out" }),
      blackX: gsap.quickTo(black, "x", { duration: 0.3, ease: "power2.out" }),
      purpleHeight: gsap.quickTo(purple, "height", { duration: 0.3, ease: "power2.out" }),
      purpleFaceLeft: gsap.quickTo(purpleFace, "left", { duration: 0.3, ease: "power2.out" }),
      purpleFaceTop: gsap.quickTo(purpleFace, "top", { duration: 0.3, ease: "power2.out" }),
      blackFaceLeft: gsap.quickTo(blackFace, "left", { duration: 0.3, ease: "power2.out" }),
      blackFaceTop: gsap.quickTo(blackFace, "top", { duration: 0.3, ease: "power2.out" }),
      orangeFaceX: gsap.quickTo(orangeFace, "x", { duration: 0.2, ease: "power2.out" }),
      orangeFaceY: gsap.quickTo(orangeFace, "y", { duration: 0.2, ease: "power2.out" }),
      yellowFaceX: gsap.quickTo(yellowFace, "x", { duration: 0.2, ease: "power2.out" }),
      yellowFaceY: gsap.quickTo(yellowFace, "y", { duration: 0.2, ease: "power2.out" }),
      mouthX: gsap.quickTo(yellowMouth, "x", { duration: 0.2, ease: "power2.out" }),
      mouthY: gsap.quickTo(yellowMouth, "y", { duration: 0.2, ease: "power2.out" }),
    };

    const tick = () => {
      const qt = qtRef.current;
      if (!qt) return;
      const s = stateRef.current;
      const container = containerRef.current;
      if (!container) return;
      const isHiding = s.passwordLength > 0 && !s.showPassword;
      const isShowing = s.passwordLength > 0 && s.showPassword;

      if (isShowing) {
        applyShowPassword();
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      // Purple
      if (purple) {
        const pp = calcPos(purple);
        if (s.isTyping || isHiding) {
          qt.purpleSkew(pp.bodySkew - 12);
          qt.purpleX(40 * SCALE);
          qt.purpleHeight(440 * SCALE);
        } else {
          qt.purpleSkew(pp.bodySkew);
          qt.purpleX(0);
          qt.purpleHeight(400 * SCALE);
        }
      }

      // Black
      if (black) {
        const bp = calcPos(black);
        if (s.isLooking) {
          qt.blackSkew(bp.bodySkew * 1.5 + 10);
          qt.blackX(20 * SCALE);
        } else if (s.isTyping || isHiding) {
          qt.blackSkew(bp.bodySkew * 1.5);
          qt.blackX(0);
        } else {
          qt.blackSkew(bp.bodySkew);
          qt.blackX(0);
        }
      }

      // Orange
      if (orange) {
        const op = calcPos(orange);
        qt.orangeSkew(op.bodySkew);
        qt.orangeFaceX(op.faceX * SCALE);
        qt.orangeFaceY(op.faceY * SCALE);
      }

      // Yellow
      if (yellow) {
        const yp = calcPos(yellow);
        qt.yellowSkew(yp.bodySkew);
        qt.yellowFaceX(yp.faceX * SCALE);
        qt.yellowFaceY(yp.faceY * SCALE);
        qt.mouthX(yp.faceX * SCALE);
        qt.mouthY(yp.faceY * SCALE);
      }

      // Purple face (not looking at each other)
      if (purple && !s.isLooking) {
        const pp = calcPos(purple);
        const pfX = pp.faceX >= 0 ? Math.min(25, pp.faceX * 1.5) : pp.faceX;
        qt.purpleFaceLeft((45 + pfX) * SCALE);
        qt.purpleFaceTop((40 + pp.faceY) * SCALE);
      }

      // Black face (not looking at each other)
      if (black && !s.isLooking) {
        const bp = calcPos(black);
        qt.blackFaceLeft((26 + bp.faceX) * SCALE);
        qt.blackFaceTop((32 + bp.faceY) * SCALE);
      }

      // Pupils (orange/yellow)
      if (!s.isLooking) {
        container.querySelectorAll<HTMLElement>(".pupil").forEach((p) => {
          const maxDist = Number(p.dataset.maxDistance) || 5;
          const ePos = calcEyePos(p, maxDist);
          gsap.set(p, { x: ePos.x, y: ePos.y });
        });
      }

      // Eyeball pupils (purple/black)
      if (!s.isLooking) {
        container.querySelectorAll<HTMLElement>(".eyeball").forEach((eb) => {
          const maxDist = Number(eb.dataset.maxDistance) || 10;
          const pupil = eb.querySelector<HTMLElement>(".eyeball-pupil");
          if (!pupil) return;
          const ePos = calcEyePos(eb, maxDist);
          gsap.set(pupil, { x: ePos.x, y: ePos.y });
        });
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    const onMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    rafRef.current = requestAnimationFrame(tick);

    // Blink schedules
    const blink = (ref: HTMLDivElement | null, size: number): ReturnType<typeof setTimeout> => {
      return setTimeout(() => {
        const eyes = ref?.querySelectorAll<HTMLElement>(".eyeball");
        eyes?.forEach((el) => {
          gsap.to(el, { height: 2, duration: 0.08, ease: "power2.in" });
        });
        setTimeout(() => {
          eyes?.forEach((el) => {
            gsap.to(el, { height: size, duration: 0.08, ease: "power2.out" });
          });
          const next = blink(ref, size);
          blinkTimersRef.current.push(next);
        }, 150);
      }, Math.random() * 4000 + 3000);
    };

    blinkTimersRef.current.push(blink(purpleRef.current, 18 * SCALE));
    blinkTimersRef.current.push(blink(blackRef.current, 16 * SCALE));

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafRef.current);
      blinkTimersRef.current.forEach(clearTimeout);
      if (lookTimerRef.current) clearTimeout(lookTimerRef.current);
    };
  }, []);

  // React to isTyping + showPassword changes (look-at-each-other effect)
  useEffect(() => {
    if (isTyping && passwordLength > 0 && !showPassword) {
      stateRef.current.isLooking = true;
      applyLookAtEachOther();
      if (lookTimerRef.current) clearTimeout(lookTimerRef.current);
      lookTimerRef.current = setTimeout(() => {
        stateRef.current.isLooking = false;
        purpleRef.current?.querySelectorAll(".eyeball-pupil").forEach((p) => {
          gsap.killTweensOf(p);
        });
      }, 800);
    } else {
      if (lookTimerRef.current) clearTimeout(lookTimerRef.current);
      stateRef.current.isLooking = false;
    }
  }, [isTyping, passwordLength, showPassword]);

  // React to hiding/showing password
  useEffect(() => {
    const isShowing = passwordLength > 0 && showPassword;
    const isHiding = passwordLength > 0 && !showPassword;
    if (isShowing) {
      applyShowPassword();
    } else if (isHiding) {
      applyHidingPassword();
    }
  }, [showPassword, passwordLength]);

  const containerStyle = {
    position: "relative" as const,
    width: W,
    height: H,
    margin: "0 auto",
    overflow: "hidden",
  };

  const purpleStyle = {
    position: "absolute" as const,
    bottom: 0,
    left: Math.round(70 * SCALE),
    width: Math.round(180 * SCALE),
    height: Math.round(400 * SCALE),
    backgroundColor: "#6C3FF5",
    borderRadius: "10px 10px 0 0",
    zIndex: 1,
    transformOrigin: "bottom center",
    willChange: "transform",
  };

  const blackStyle = {
    position: "absolute" as const,
    bottom: 0,
    left: Math.round(240 * SCALE),
    width: Math.round(120 * SCALE),
    height: Math.round(310 * SCALE),
    backgroundColor: "#2D2D2D",
    borderRadius: "8px 8px 0 0",
    zIndex: 2,
    transformOrigin: "bottom center",
    willChange: "transform",
  };

  const orangeStyle = {
    position: "absolute" as const,
    bottom: 0,
    left: 0,
    width: Math.round(240 * SCALE),
    height: Math.round(200 * SCALE),
    backgroundColor: "#FF9B6B",
    borderRadius: "120px 120px 0 0",
    zIndex: 3,
    transformOrigin: "bottom center",
    willChange: "transform",
  };

  const yellowStyle = {
    position: "absolute" as const,
    bottom: 0,
    left: Math.round(310 * SCALE),
    width: Math.round(140 * SCALE),
    height: Math.round(230 * SCALE),
    backgroundColor: "#E8D754",
    borderRadius: "70px 70px 0 0",
    zIndex: 4,
    transformOrigin: "bottom center",
    willChange: "transform",
  };

  const purpleFaceStyle = { position: "absolute" as const, display: "flex", gap: Math.round(32 * SCALE), left: Math.round(45 * SCALE), top: Math.round(40 * SCALE) };
  const blackFaceStyle = { position: "absolute" as const, display: "flex", gap: Math.round(24 * SCALE), left: Math.round(26 * SCALE), top: Math.round(32 * SCALE) };
  const orangeFaceStyle = { position: "absolute" as const, display: "flex", gap: Math.round(32 * SCALE), left: Math.round(82 * SCALE), top: Math.round(90 * SCALE) };
  const yellowFaceStyle = { position: "absolute" as const, display: "flex", gap: Math.round(24 * SCALE), left: Math.round(52 * SCALE), top: Math.round(40 * SCALE) };
  const yellowMouthStyle = {
    position: "absolute" as const,
    width: Math.round(80 * SCALE),
    height: Math.round(4 * SCALE),
    backgroundColor: "#2D2D2D",
    borderRadius: 9999,
    left: Math.round(40 * SCALE),
    top: Math.round(88 * SCALE),
  };

  const smallEyeW = Math.round(18 * SCALE);
  const smallEyeH = Math.round(18 * SCALE);
  const smallEye = { ...EYE_BASE, width: smallEyeW, height: smallEyeH, backgroundColor: "white" } as const;
  const smallPupil = { width: Math.round(7 * SCALE), height: Math.round(7 * SCALE), borderRadius: "50%", backgroundColor: "#2D2D2D", willChange: "transform" } as const;

  const blackEyeW = Math.round(16 * SCALE);
  const blackEyeH = Math.round(16 * SCALE);
  const blackEye = { ...EYE_BASE, width: blackEyeW, height: blackEyeH, backgroundColor: "white" } as const;
  const blackPupil = { width: Math.round(6 * SCALE), height: Math.round(6 * SCALE), borderRadius: "50%", backgroundColor: "#2D2D2D", willChange: "transform" } as const;

  const dotPupilW = Math.round(12 * SCALE);
  const dotPupil = { width: dotPupilW, height: dotPupilW, borderRadius: "50%", backgroundColor: "#2D2D2D", willChange: "transform" } as const;

  return (
    <div ref={containerRef} style={containerStyle}>
      {/* Purple character */}
      <div ref={purpleRef} style={purpleStyle}>
        <div ref={purpleFaceRef} style={purpleFaceStyle}>
          <div className="eyeball" data-max-distance="5" style={smallEye}>
            <div className="eyeball-pupil" style={smallPupil} />
          </div>
          <div className="eyeball" data-max-distance="5" style={smallEye}>
            <div className="eyeball-pupil" style={smallPupil} />
          </div>
        </div>
      </div>

      {/* Black character */}
      <div ref={blackRef} style={blackStyle}>
        <div ref={blackFaceRef} style={blackFaceStyle}>
          <div className="eyeball" data-max-distance="4" style={blackEye}>
            <div className="eyeball-pupil" style={blackPupil} />
          </div>
          <div className="eyeball" data-max-distance="4" style={blackEye}>
            <div className="eyeball-pupil" style={blackPupil} />
          </div>
        </div>
      </div>

      {/* Orange character */}
      <div ref={orangeRef} style={orangeStyle}>
        <div ref={orangeFaceRef} style={orangeFaceStyle}>
          <div className="pupil" data-max-distance="5" style={dotPupil} />
          <div className="pupil" data-max-distance="5" style={dotPupil} />
        </div>
      </div>

      {/* Yellow character */}
      <div ref={yellowRef} style={yellowStyle}>
        <div ref={yellowFaceRef} style={yellowFaceStyle}>
          <div className="pupil" data-max-distance="5" style={dotPupil} />
          <div className="pupil" data-max-distance="5" style={dotPupil} />
        </div>
        <div ref={yellowMouthRef} style={yellowMouthStyle} />
      </div>
    </div>
  );
}
