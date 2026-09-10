"use client";

import {
  useInView,
  useMotionValue,
  useSpring,
} from "motion/react";
import { useCallback, useEffect, useRef } from "react";

interface CountUpProps {
  to: number;
  from?: number;
  direction?: "up" | "down";
  delay?: number;
  duration?: number;
  className?: string;
  startWhen?: boolean;
  separator?: string;
  onStart?: () => void;
  onEnd?: () => void;
}

const getDecimalPlaces = (value: number) => {
  const text = value.toString();
  if (!text.includes(".")) return 0;

  const decimals = text.split(".")[1];
  return Number.parseInt(decimals, 10) === 0 ? 0 : decimals.length;
};

export default function CountUp({
  to,
  from = 0,
  direction = "up",
  delay = 0,
  duration = 2,
  className = "",
  startWhen = true,
  separator = "",
  onStart,
  onEnd,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(direction === "down" ? to : from);
  const damping = 20 + 40 * (1 / duration);
  const stiffness = 100 * (1 / duration);
  const springValue = useSpring(motionValue, { damping, stiffness });
  const isInView = useInView(ref, { once: true, margin: "0px" });
  const maxDecimals = Math.max(getDecimalPlaces(from), getDecimalPlaces(to));

  const formatValue = useCallback(
    (latest: number) => {
      const options: Intl.NumberFormatOptions = {
        useGrouping: Boolean(separator),
        minimumFractionDigits: maxDecimals,
        maximumFractionDigits: maxDecimals,
      };
      const formatted = Intl.NumberFormat("en-US", options).format(latest);
      return separator ? formatted.replace(/,/g, separator) : formatted;
    },
    [maxDecimals, separator],
  );

  useEffect(() => {
    if (!ref.current) return;
    ref.current.textContent = formatValue(direction === "down" ? to : from);
  }, [direction, formatValue, from, to]);

  useEffect(() => {
    if (!isInView || !startWhen) return;

    onStart?.();
    const startTimer = window.setTimeout(() => {
      motionValue.set(direction === "down" ? from : to);
    }, delay * 1000);
    const endTimer = window.setTimeout(
      () => onEnd?.(),
      delay * 1000 + duration * 1000,
    );

    return () => {
      window.clearTimeout(startTimer);
      window.clearTimeout(endTimer);
    };
  }, [
    delay,
    direction,
    duration,
    from,
    isInView,
    motionValue,
    onEnd,
    onStart,
    startWhen,
    to,
  ]);

  useEffect(() => {
    return springValue.on("change", (latest: number) => {
      if (ref.current) {
        ref.current.textContent = formatValue(latest);
      }
    });
  }, [formatValue, springValue]);

  return <span ref={ref} className={className} />;
}
