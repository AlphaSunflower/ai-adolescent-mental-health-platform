"use client";

import { motion } from "motion/react";
import {
  forwardRef,
  type HTMLAttributes,
  type RefObject,
  useEffect,
  useMemo,
  useRef,
} from "react";
import "./variable-proximity.css";

function useAnimationFrame(callback: () => void) {
  useEffect(() => {
    let frameId = 0;
    const loop = () => {
      callback();
      frameId = window.requestAnimationFrame(loop);
    };

    frameId = window.requestAnimationFrame(loop);
    return () => window.cancelAnimationFrame(frameId);
  }, [callback]);
}

function useMousePositionRef(containerRef: RefObject<HTMLElement | null>) {
  const positionRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const updatePosition = (x: number, y: number) => {
      const container = containerRef.current;
      if (container) {
        const rect = container.getBoundingClientRect();
        positionRef.current = {
          x: x - rect.left,
          y: y - rect.top,
        };
      } else {
        positionRef.current = { x, y };
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      updatePosition(event.clientX, event.clientY);
    };
    const handleTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (touch) updatePosition(touch.clientX, touch.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, [containerRef]);

  return positionRef;
}

interface VariableProximityProps
  extends HTMLAttributes<HTMLSpanElement> {
  label: string;
  fromFontVariationSettings: string;
  toFontVariationSettings: string;
  containerRef: RefObject<HTMLElement | null>;
  radius?: number;
  falloff?: "linear" | "exponential" | "gaussian";
}

const VariableProximity = forwardRef<
  HTMLSpanElement,
  VariableProximityProps
>(function VariableProximity(
  {
    label,
    fromFontVariationSettings,
    toFontVariationSettings,
    containerRef,
    radius = 50,
    falloff = "linear",
    className = "",
    style,
    ...restProps
  },
  ref,
) {
  const letterRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const mousePositionRef = useMousePositionRef(containerRef);
  const lastPositionRef = useRef<{
    x: number | null;
    y: number | null;
  }>({ x: null, y: null });

  const parsedSettings = useMemo(() => {
    const parseSettings = (settings: string) =>
      new Map(
        settings
          .split(",")
          .map((part) => part.trim())
          .map((part) => {
            const [axis, value] = part.split(" ");
            return [axis.replace(/['"]/g, ""), Number.parseFloat(value)];
          }),
      );

    const fromSettings = parseSettings(fromFontVariationSettings);
    const toSettings = parseSettings(toFontVariationSettings);

    return Array.from(fromSettings.entries()).map(([axis, fromValue]) => ({
      axis,
      fromValue,
      toValue: toSettings.get(axis) ?? fromValue,
    }));
  }, [fromFontVariationSettings, toFontVariationSettings]);

  const calculateFalloff = (distance: number) => {
    const normalized = Math.min(Math.max(1 - distance / radius, 0), 1);

    if (falloff === "exponential") return normalized ** 2;
    if (falloff === "gaussian") {
      return Math.exp(-((distance / (radius / 2)) ** 2) / 2);
    }
    return normalized;
  };

  useAnimationFrame(() => {
    const container = containerRef.current;
    if (!container) return;

    const { x, y } = mousePositionRef.current;
    if (lastPositionRef.current.x === x && lastPositionRef.current.y === y) {
      return;
    }
    lastPositionRef.current = { x, y };

    const containerRect = container.getBoundingClientRect();
    letterRefs.current.forEach((letter, index) => {
      if (!letter) return;

      const rect = letter.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2 - containerRect.left;
      const centerY = rect.top + rect.height / 2 - containerRect.top;
      const distance = Math.hypot(x - centerX, y - centerY);

      if (distance >= radius) {
        letter.style.fontVariationSettings = fromFontVariationSettings;
        return;
      }

      const strength = calculateFalloff(distance);
      const settings = parsedSettings
        .map(({ axis, fromValue, toValue }) => {
          const interpolated = fromValue + (toValue - fromValue) * strength;
          return `'${axis}' ${interpolated}`;
        })
        .join(", ");

      letter.style.fontVariationSettings = settings;
    });
  });

  const words = label.split(" ");
  let letterIndex = 0;

  return (
    <span
      ref={ref}
      className={`variable-proximity ${className}`.trim()}
      style={{ display: "inline", ...style }}
      {...restProps}
    >
      {words.map((word, wordIndex) => (
        <span
          key={`${word}-${wordIndex}`}
          style={{ display: "inline-block", whiteSpace: "nowrap" }}
        >
          {word.split("").map((letter) => {
            const currentIndex = letterIndex;
            letterIndex += 1;
            return (
              <motion.span
                key={currentIndex}
                ref={(element) => {
                  letterRefs.current[currentIndex] = element;
                }}
                style={{ display: "inline-block" }}
                aria-hidden="true"
              >
                {letter}
              </motion.span>
            );
          })}
          {wordIndex < words.length - 1 ? (
            <span style={{ display: "inline-block" }}>&nbsp;</span>
          ) : null}
        </span>
      ))}
      <span className="sr-only">{label}</span>
    </span>
  );
});

VariableProximity.displayName = "VariableProximity";

export default VariableProximity;
