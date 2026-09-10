"use client";

import Link from "next/link";
import { useState } from "react";

const NAV_LINKS = [
  { label: "首页", href: "#hero" },
  { label: "功能介绍", href: "#features" },
  { label: "团队文化", href: "#culture" },
] as const;

export default function OfficialNavbar() {
  const [open, setOpen] = useState(false);

  const scrollTo = (href: string) => {
    setOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-white/85 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
        <a
          href="#hero"
          onClick={(e) => {
            e.preventDefault();
            scrollTo("#hero");
          }}
          className="flex items-center gap-2.5"
        >
          <img
            src="/logo.png"
            alt="心愈智联 Logo"
            className="h-9 w-auto object-contain"
          />
          <span className="official-brand-font text-lg font-bold text-[#4A4266]">
            心愈智联
          </span>
        </a>

        <div className="hidden items-center gap-7 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-[#8A84A3] transition-colors hover:text-[#4A4266]"
              onClick={(e) => {
                e.preventDefault();
                scrollTo(link.href);
              }}
            >
              {link.label}
            </a>
          ))}
          <Link
            href="/login"
            className="rounded-full bg-[#8B7CC8] px-5 py-2 text-sm font-bold text-white transition-colors hover:bg-[#7A6BBA]"
          >
            进入平台
          </Link>
        </div>

        <button
          type="button"
          aria-label={open ? "关闭菜单" : "打开菜单"}
          className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-full transition-colors hover:bg-[#F1EEFA] md:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          <span
            className={`h-0.5 w-5 rounded-full bg-[#4A4266] transition-transform ${open ? "translate-y-2 rotate-45" : ""}`}
          />
          <span
            className={`h-0.5 w-5 rounded-full bg-[#4A4266] transition-opacity ${open ? "opacity-0" : ""}`}
          />
          <span
            className={`h-0.5 w-5 rounded-full bg-[#4A4266] transition-transform ${open ? "-translate-y-2 -rotate-45" : ""}`}
          />
        </button>
      </nav>

      {open && (
        <div className="border-t border-[#EFEBFA] bg-white/95 px-6 py-4 backdrop-blur-xl md:hidden">
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-full px-4 py-2 text-sm text-[#8A84A3] transition-colors hover:bg-[#F1EEFA] hover:text-[#4A4266]"
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo(link.href);
                }}
              >
                {link.label}
              </a>
            ))}
            <Link
              href="/login"
              className="mt-2 rounded-full bg-[#8B7CC8] px-5 py-2 text-center text-sm font-bold text-white"
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
