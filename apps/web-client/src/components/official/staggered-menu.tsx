"use client";

import { gsap } from "gsap";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import "./staggered-menu.css";

export interface StaggeredMenuItem {
  label: string;
  ariaLabel: string;
  link: string;
}

interface StaggeredMenuProps {
  position?: "left" | "right";
  colors?: string[];
  items?: StaggeredMenuItem[];
  menuLabel?: string;
  closeLabel?: string;
  className?: string;
  menuButtonColor?: string;
  openMenuButtonColor?: string;
  accentColor?: string;
  isFixed?: boolean;
  closeOnClickAway?: boolean;
  onMenuOpen?: () => void;
  onMenuClose?: () => void;
}

export default function StaggeredMenu({
  position = "right",
  colors = ["#B497CF", "#5227FF"],
  items = [],
  menuLabel = "Menu",
  closeLabel = "Close",
  className = "",
  menuButtonColor = "#fff",
  openMenuButtonColor = "#fff",
  accentColor = "#5227FF",
  isFixed = false,
  closeOnClickAway = true,
  onMenuOpen,
  onMenuClose,
}: StaggeredMenuProps) {
  const [open, setOpen] = useState(false);
  const [textLines, setTextLines] = useState([menuLabel, closeLabel]);
  const openRef = useRef(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const preLayersRef = useRef<HTMLDivElement>(null);
  const preLayerElsRef = useRef<HTMLElement[]>([]);
  const plusHRef = useRef<HTMLSpanElement>(null);
  const plusVRef = useRef<HTMLSpanElement>(null);
  const iconRef = useRef<HTMLSpanElement>(null);
  const textInnerRef = useRef<HTMLSpanElement>(null);
  const textWrapRef = useRef<HTMLSpanElement>(null);
  const toggleBtnRef = useRef<HTMLButtonElement>(null);
  const openTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const closeTweenRef = useRef<gsap.core.Tween | null>(null);
  const iconTweenRef = useRef<gsap.core.Tween | null>(null);
  const textTweenRef = useRef<gsap.core.Tween | null>(null);
  const colorTweenRef = useRef<gsap.core.Tween | null>(null);
  const busyRef = useRef(false);

  useLayoutEffect(() => {
    const context = gsap.context(() => {
      const panel = panelRef.current;
      const preContainer = preLayersRef.current;
      const plusH = plusHRef.current;
      const plusV = plusVRef.current;
      const icon = iconRef.current;
      const textInner = textInnerRef.current;
      if (!panel || !plusH || !plusV || !icon || !textInner) return;

      preLayerElsRef.current = preContainer
        ? Array.from(
            preContainer.querySelectorAll<HTMLElement>(".sm-prelayer"),
          )
        : [];

      const offscreen = position === "left" ? -100 : 100;
      gsap.set([panel, ...preLayerElsRef.current], {
        xPercent: offscreen,
        opacity: 1,
      });
      if (preContainer) {
        gsap.set(preContainer, { xPercent: 0, opacity: 1 });
      }
      gsap.set(plusH, { transformOrigin: "50% 50%", rotate: 0 });
      gsap.set(plusV, { transformOrigin: "50% 50%", rotate: 90 });
      gsap.set(icon, { rotate: 0, transformOrigin: "50% 50%" });
      gsap.set(textInner, { yPercent: 0 });
      if (toggleBtnRef.current) {
        gsap.set(toggleBtnRef.current, { color: menuButtonColor });
      }
    });

    return () => context.revert();
  }, [menuButtonColor, position]);

  useEffect(() => {
    setTextLines(
      openRef.current ? [closeLabel, menuLabel] : [menuLabel, closeLabel],
    );
  }, [closeLabel, menuLabel]);

  const buildOpenTimeline = useCallback(() => {
    const panel = panelRef.current;
    if (!panel) return null;

    openTimelineRef.current?.kill();
    closeTweenRef.current?.kill();
    closeTweenRef.current = null;

    const itemLabels = Array.from(
      panel.querySelectorAll<HTMLElement>(".sm-panel-itemLabel"),
    );
    const numberedItems = Array.from(
      panel.querySelectorAll<HTMLElement>(
        ".sm-panel-list[data-numbering] .sm-panel-item",
      ),
    );
    const offscreen = position === "left" ? -100 : 100;
    const layers = preLayerElsRef.current;

    if (itemLabels.length) {
      gsap.set(itemLabels, { yPercent: 140, rotate: 8 });
    }
    if (numberedItems.length) {
      gsap.set(numberedItems, { "--sm-num-opacity": 0 });
    }

    const timeline = gsap.timeline({ paused: true });

    layers.forEach((layer, index) => {
      timeline.fromTo(
        layer,
        { xPercent: offscreen },
        { xPercent: 0, duration: 0.5, ease: "power4.out" },
        index * 0.07,
      );
    });

    const lastLayerTime = layers.length ? (layers.length - 1) * 0.07 : 0;
    const panelStart = lastLayerTime + (layers.length ? 0.08 : 0);
    const panelDuration = 0.65;
    timeline.fromTo(
      panel,
      { xPercent: offscreen },
      { xPercent: 0, duration: panelDuration, ease: "power4.out" },
      panelStart,
    );

    if (itemLabels.length) {
      const itemsStart = panelStart + panelDuration * 0.15;
      timeline.to(
        itemLabels,
        {
          yPercent: 0,
          rotate: 0,
          duration: 0.72,
          ease: "power4.out",
          stagger: { each: 0.03, from: "start" },
        },
        itemsStart,
      );
      if (numberedItems.length) {
        timeline.to(
          numberedItems,
          {
            duration: 0.5,
            ease: "power2.out",
            "--sm-num-opacity": 1,
            stagger: { each: 0.025, from: "start" },
          },
          itemsStart + 0.05,
        );
      }
    }

    openTimelineRef.current = timeline;
    return timeline;
  }, [position]);

  const playOpen = useCallback(() => {
    if (busyRef.current) return;
    busyRef.current = true;
    const timeline = buildOpenTimeline();
    if (!timeline) {
      busyRef.current = false;
      return;
    }
    timeline.eventCallback("onComplete", () => {
      busyRef.current = false;
    });
    timeline.play(0);
  }, [buildOpenTimeline]);

  const playClose = useCallback(() => {
    openTimelineRef.current?.kill();
    openTimelineRef.current = null;

    const panel = panelRef.current;
    if (!panel) return;

    const offscreen = position === "left" ? -100 : 100;
    closeTweenRef.current?.kill();
    closeTweenRef.current = gsap.to(
      [...preLayerElsRef.current, panel],
      {
        xPercent: offscreen,
        duration: 0.32,
        ease: "power3.in",
        overwrite: "auto",
        onComplete: () => {
          const itemLabels = Array.from(
            panel.querySelectorAll<HTMLElement>(".sm-panel-itemLabel"),
          );
          if (itemLabels.length) {
            gsap.set(itemLabels, { yPercent: 140, rotate: 8 });
          }
          const numberedItems = Array.from(
            panel.querySelectorAll<HTMLElement>(
              ".sm-panel-list[data-numbering] .sm-panel-item",
            ),
          );
          if (numberedItems.length) {
            gsap.set(numberedItems, { "--sm-num-opacity": 0 });
          }
          busyRef.current = false;
        },
      },
    );
  }, [position]);

  const animateIcon = useCallback((opening: boolean) => {
    const icon = iconRef.current;
    if (!icon) return;
    iconTweenRef.current?.kill();
    iconTweenRef.current = gsap.to(icon, {
      rotate: opening ? 225 : 0,
      duration: opening ? 0.75 : 0.35,
      ease: opening ? "power4.out" : "power3.inOut",
      overwrite: "auto",
    });
  }, []);

  const animateText = useCallback(
    (opening: boolean) => {
      const inner = textInnerRef.current;
      if (!inner) return;

      textTweenRef.current?.kill();
      const currentLabel = opening ? menuLabel : closeLabel;
      const targetLabel = opening ? closeLabel : menuLabel;
      const sequence = [currentLabel, targetLabel, currentLabel, targetLabel];
      setTextLines(sequence);
      gsap.set(inner, { yPercent: 0 });
      const finalShift = ((sequence.length - 1) / sequence.length) * 100;
      textTweenRef.current = gsap.to(inner, {
        yPercent: -finalShift,
        duration: 0.5 + sequence.length * 0.06,
        ease: "power4.out",
      });
    },
    [closeLabel, menuLabel],
  );

  const animateColor = useCallback(
    (opening: boolean) => {
      const button = toggleBtnRef.current;
      if (!button) return;
      colorTweenRef.current?.kill();
      colorTweenRef.current = gsap.to(button, {
        color: opening ? openMenuButtonColor : menuButtonColor,
        delay: 0.12,
        duration: 0.3,
        ease: "power2.out",
      });
    },
    [menuButtonColor, openMenuButtonColor],
  );

  const closeMenu = useCallback(() => {
    if (!openRef.current) return;
    openRef.current = false;
    setOpen(false);
    onMenuClose?.();
    playClose();
    animateIcon(false);
    animateText(false);
    animateColor(false);
  }, [animateColor, animateIcon, animateText, onMenuClose, playClose]);

  const toggleMenu = useCallback(() => {
    const nextOpen = !openRef.current;
    openRef.current = nextOpen;
    setOpen(nextOpen);
    if (nextOpen) {
      onMenuOpen?.();
      playOpen();
    } else {
      onMenuClose?.();
      playClose();
    }
    animateIcon(nextOpen);
    animateText(nextOpen);
    animateColor(nextOpen);
  }, [
    animateColor,
    animateIcon,
    animateText,
    onMenuClose,
    onMenuOpen,
    playClose,
    playOpen,
  ]);

  useEffect(() => {
    if (!closeOnClickAway || !open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node) &&
        !toggleBtnRef.current?.contains(event.target as Node)
      ) {
        closeMenu();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [closeMenu, closeOnClickAway, open]);

  const layerColors =
    colors.length > 0 ? colors.slice(0, 4) : ["#1e1e22", "#35353c"];

  return (
    <div
      className={`${className} staggered-menu-wrapper ${
        isFixed ? "fixed-wrapper" : ""
      }`.trim()}
      style={{ "--sm-accent": accentColor } as React.CSSProperties}
      data-position={position}
      data-open={open || undefined}
    >
      <div ref={preLayersRef} className="sm-prelayers" aria-hidden="true">
        {layerColors.map((color) => (
          <div
            key={color}
            className="sm-prelayer"
            style={{ background: color }}
          />
        ))}
      </div>

      <header className="staggered-menu-header">
        <button
          ref={toggleBtnRef}
          type="button"
          className="sm-toggle"
          aria-label={open ? closeLabel : menuLabel}
          aria-expanded={open}
          aria-controls="official-staggered-menu-panel"
          onClick={toggleMenu}
        >
          <span ref={textWrapRef} className="sm-toggle-textWrap" aria-hidden="true">
            <span ref={textInnerRef} className="sm-toggle-textInner">
              {textLines.map((line, index) => (
                <span className="sm-toggle-line" key={`${line}-${index}`}>
                  {line}
                </span>
              ))}
            </span>
          </span>
          <span ref={iconRef} className="sm-icon" aria-hidden="true">
            <span ref={plusHRef} className="sm-icon-line" />
            <span ref={plusVRef} className="sm-icon-line sm-icon-line-v" />
          </span>
        </button>
      </header>

      <aside
        id="official-staggered-menu-panel"
        ref={panelRef}
        className="staggered-menu-panel"
        aria-hidden={!open}
      >
        <div className="sm-panel-inner">
          <ul
            className="sm-panel-list"
            role="list"
            data-numbering={items.length > 0 || undefined}
          >
            {items.map((item, index) => (
              <li className="sm-panel-itemWrap" key={`${item.link}-${index}`}>
                <a
                  className="sm-panel-item"
                  href={item.link}
                  aria-label={item.ariaLabel}
                  data-index={index + 1}
                >
                  <span className="sm-panel-itemLabel">{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}
