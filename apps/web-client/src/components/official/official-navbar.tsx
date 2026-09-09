"use client";

import Link from "next/link";
import { useState } from "react";

const NAV_LINKS = [
  { label: "首页", href: "#hero" },
  { label: "功能介绍", href: "#features" },
  { label: "团队文化", href: "#culture" },
  { label: "微信公众号", href: "#qrcode" },
] as const;

export default function OfficialNavbar() {
  const [open, setOpen] = useState(false);

  const scrollTo = (href: string) => {
    setOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  const linkClass =
    "rounded-full px-4 py-2 text-sm text-[var(--muted)] transition-colors hover:bg-white hover:text-[var(--ink)]";

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[rgba(58,46,92,0.08)] bg-white/75 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
        <a
          href="#hero"
          onClick={(e) => {
            e.preventDefault();
            scrollTo("#hero");
          }}
          className="flex items-center gap-2"
        >
          <img src="/xinyuzhilian.svg" alt="心愈智联 Logo" className="h-8 w-8" />
          <span className="official-brand-font text-xl font-bold text-[var(--ink)]">
            心愈智联
          </span>
        </a>

        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={linkClass}
              onClick={(e) => {
                e.preventDefault();
                scrollTo(link.href);
              }}
            >
              {link.label}
            </a>
          ))}
          <Link
            href="/home"
            className="ml-3 rounded-full bg-[var(--purple)] px-5 py-2 text-sm font-bold text-[var(--on-accent)] transition-transform duration-300 hover:scale-[1.04]"
          >
            进入平台
          </Link>
        </div>

        <button
          type="button"
          aria-label={open ? "关闭菜单" : "打开菜单"}
          className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-full transition-colors hover:bg-white md:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          <span
            className={`h-0.5 w-5 rounded-full bg-[var(--ink)] transition-transform ${open ? "translate-y-2 rotate-45" : ""}`}
          />
          <span
            className={`h-0.5 w-5 rounded-full bg-[var(--ink)] transition-opacity ${open ? "opacity-0" : ""}`}
          />
          <span
            className={`h-0.5 w-5 rounded-full bg-[var(--ink)] transition-transform ${open ? "-translate-y-2 -rotate-45" : ""}`}
          />
        </button>
      </nav>

      {open && (
        <div className="border-t border-[rgba(58,46,92,0.08)] bg-white/90 px-6 py-4 backdrop-blur-xl md:hidden">
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={linkClass}
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo(link.href);
                }}
              >
                {link.label}
              </a>
            ))}
            <Link
              href="/home"
              className="mt-2 rounded-full bg-[var(--purple)] px-5 py-2 text-center text-sm font-bold text-[var(--on-accent)]"
              onClick={() => setOpen(false)}
            >
              进入平台
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
