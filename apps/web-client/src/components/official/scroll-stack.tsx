"use client";

import Lenis from "lenis";
import {
  useCallback,
  useLayoutEffect,
  useRef,
  type ReactNode,
} from "react";
import "./scroll-stack.css";

export interface ScrollStackItemProps {
  id?: string;
  itemClassName?: string;
  children: ReactNode;
}

export function ScrollStackItem({
  id,
  children,
  itemClassName = "",
}: ScrollStackItemProps) {
  return (
    <div id={id} className={`scroll-stack-card ${itemClassName}`.trim()}>
      {children}
    </div>
  );
}

interface ScrollStackProps {
  className?: string;
  children: ReactNode;
  itemDistance?: number;
  itemScale?: number;
  itemStackDistance?: number;
  stackPosition?: string;
  scaleEndPosition?: string;
  baseScale?: number;
  rotationAmount?: number;
  useWindowScroll?: boolean;
  onStackComplete?: () => void;
}

type CardTransform = {
  translateY: number;
  scale: number;
  rotation: number;
};

const calculateProgress = (scrollTop: number, start: number, end: number) => {
  if (scrollTop < start) return 0;
  if (scrollTop > end) return 1;
  return (scrollTop - start) / (end - start);
};

const parsePercentage = (value: string | number, containerHeight: number) => {
  if (typeof value === "string" && value.includes("%")) {
    return (Number.parseFloat(value) / 100) * containerHeight;
  }
  return Number.parseFloat(String(value));
};

export default function ScrollStack({
  children,
  className = "",
  itemDistance = 100,
  itemScale = 0.03,
  itemStackDistance = 30,
  stackPosition = "20%",
  scaleEndPosition = "10%",
  baseScale = 0.85,
  rotationAmount = 0,
  useWindowScroll = false,
  onStackComplete,
}: ScrollStackProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLElement[]>([]);
  const lastTransformsRef = useRef(new Map<number, CardTransform>());
  const animationFrameRef = useRef<number | null>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const stackCompletedRef = useRef(false);

  const getScrollData = useCallback(() => {
    if (useWindowScroll) {
      return {
        scrollTop: window.scrollY,
        containerHeight: window.innerHeight,
      };
    }

    const scroller = scrollerRef.current;
    return {
      scrollTop: scroller?.scrollTop ?? 0,
      containerHeight: scroller?.clientHeight ?? 0,
    };
  }, [useWindowScroll]);

  const getElementOffset = useCallback(
    (element: HTMLElement) => {
      if (useWindowScroll) {
        let offset = 0;
        let current: HTMLElement | null = element;
        while (current) {
          offset += current.offsetTop;
          current = current.offsetParent as HTMLElement | null;
        }
        return offset;
      }
      return element.offsetTop;
    },
    [useWindowScroll],
  );

  const updateCardTransforms = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller || cardsRef.current.length === 0) return;

    const { scrollTop, containerHeight } = getScrollData();
    const stackPositionPx = parsePercentage(stackPosition, containerHeight);
    const scaleEndPositionPx = parsePercentage(
      scaleEndPosition,
      containerHeight,
    );
    const endElement = scroller.querySelector<HTMLElement>(
      ".scroll-stack-end",
    );
    const endElementTop = endElement ? getElementOffset(endElement) : 0;

    cardsRef.current.forEach((card, index) => {
      const cardTop = getElementOffset(card);
      const triggerStart =
        cardTop - stackPositionPx - itemStackDistance * index;
      const triggerEnd = cardTop - scaleEndPositionPx;
      const pinStart = triggerStart;
      const pinEnd = endElementTop - containerHeight / 2;
      const scaleProgress = calculateProgress(
        scrollTop,
        triggerStart,
        triggerEnd,
      );
      const targetScale = baseScale + index * itemScale;
      const scale = 1 - scaleProgress * (1 - targetScale);
      const rotation =
        rotationAmount * index * scaleProgress;

      let translateY = 0;
      if (scrollTop >= pinStart && scrollTop <= pinEnd) {
        translateY =
          scrollTop -
          cardTop +
          stackPositionPx +
          itemStackDistance * index;
      } else if (scrollTop > pinEnd) {
        translateY =
          pinEnd -
          cardTop +
          stackPositionPx +
          itemStackDistance * index;
      }

      const nextTransform = {
        translateY: Math.round(translateY * 100) / 100,
        scale: Math.round(scale * 1000) / 1000,
        rotation: Math.round(rotation * 100) / 100,
      };
      const lastTransform = lastTransformsRef.current.get(index);
      const changed =
        !lastTransform ||
        Math.abs(lastTransform.translateY - nextTransform.translateY) > 0.1 ||
        Math.abs(lastTransform.scale - nextTransform.scale) > 0.001 ||
        Math.abs(lastTransform.rotation - nextTransform.rotation) > 0.1;

      if (changed) {
        card.style.transform = `translate3d(0, ${nextTransform.translateY}px, 0) scale(${nextTransform.scale}) rotate(${nextTransform.rotation}deg)`;
        lastTransformsRef.current.set(index, nextTransform);
      }

      if (index === cardsRef.current.length - 1) {
        const inView = scrollTop >= pinStart && scrollTop <= pinEnd;
        if (inView && !stackCompletedRef.current) {
          stackCompletedRef.current = true;
          onStackComplete?.();
        } else if (!inView && stackCompletedRef.current) {
          stackCompletedRef.current = false;
        }
      }
    });
  }, [
    baseScale,
    getElementOffset,
    getScrollData,
    itemScale,
    itemStackDistance,
    onStackComplete,
    rotationAmount,
    scaleEndPosition,
    stackPosition,
  ]);

  const setupLenis = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const lenis = new Lenis({
      wrapper: useWindowScroll ? window : scroller,
      content: useWindowScroll
        ? document.documentElement
        : scroller.querySelector<HTMLElement>(".scroll-stack-inner") ??
          undefined,
      duration: reducedMotion ? 0 : 1.1,
      lerp: reducedMotion ? 1 : 0.1,
      smoothWheel: !reducedMotion,
      syncTouch: !reducedMotion,
      touchMultiplier: 1.5,
      wheelMultiplier: 1,
      infinite: false,
    });

    lenis.on("scroll", updateCardTransforms);
    const frame = (time: number) => {
      lenis.raf(time);
      animationFrameRef.current = window.requestAnimationFrame(frame);
    };

    animationFrameRef.current = window.requestAnimationFrame(frame);
    lenisRef.current = lenis;
  }, [updateCardTransforms, useWindowScroll]);

  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const cards = Array.from(
      scroller.querySelectorAll<HTMLElement>(".scroll-stack-card"),
    );
    cardsRef.current = cards;

    cards.forEach((card, index) => {
      if (index < cards.length - 1) {
        card.style.marginBottom = `${itemDistance}px`;
      }
      card.style.willChange = "transform";
      card.style.transformOrigin = "top center";
      card.style.backfaceVisibility = "hidden";
      card.style.transform = "translateZ(0)";
    });

    setupLenis();
    updateCardTransforms();

    const resizeObserver = new ResizeObserver(updateCardTransforms);
    resizeObserver.observe(scroller);
    const scrollTarget = useWindowScroll ? window : scroller;
    scrollTarget.addEventListener("scroll", updateCardTransforms, {
      passive: true,
    });

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      resizeObserver.disconnect();
      scrollTarget.removeEventListener("scroll", updateCardTransforms);
      lenisRef.current?.destroy();
      lenisRef.current = null;
      cardsRef.current = [];
      lastTransformsRef.current.clear();
      stackCompletedRef.current = false;
    };
  }, [
    itemDistance,
    setupLenis,
    updateCardTransforms,
    useWindowScroll,
  ]);

  return (
    <div
      ref={scrollerRef}
      className={`scroll-stack-scroller ${className}`.trim()}
    >
      <div className="scroll-stack-inner">
        {children}
        <div className="scroll-stack-end" aria-hidden="true" />
      </div>
    </div>
  );
}
