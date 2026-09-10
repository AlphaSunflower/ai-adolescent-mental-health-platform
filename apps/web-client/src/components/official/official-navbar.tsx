"use client";

import Link from "next/link";
import ClickSpark from "./click-spark";
import OfficialMenu from "./official-menu";

const NAV_LINKS = [
  { label: "首页", href: "#hero" },
  { label: "功能介绍", href: "#features" },
  { label: "团队文化", href: "#culture" },
] as const;

export default function OfficialNavbar() {
  const scrollTo = (href: string) => {
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <OfficialMenu />
      <header className="official-navbar fixed inset-x-0 top-0 z-50 bg-white/85 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-5xl items-center justify-between pl-20 pr-6">
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
          <ClickSpark>
            <Link
              href="/login"
              className="block rounded-full bg-[#8B7CC8] px-5 py-2 text-sm font-bold text-white transition-colors hover:bg-[#7A6BBA]"
            >
              进入平台
            </Link>
          </ClickSpark>
        </div>

      </nav>
      </header>
    </>
  );
}
