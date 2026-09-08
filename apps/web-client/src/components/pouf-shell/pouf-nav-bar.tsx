"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import {
  Search, User, LogOut, MessageCircle, Heart, ShoppingBag, Star,
  Menu, X, ChevronDown, Leaf, Headphones, FileText,
} from "lucide-react";
import { Button, IconButton } from "@/components/pouf/Button";
import { isLoggedIn, getStoredUser, clearSession } from "@/lib/session";
import { type UserProfile } from "@/lib/types";
import { useFeedbackDialog } from "@/components/feedback/feedback-dialog";

const NAV_ITEMS = [
  { href: "/home", label: "首页" },
  { href: "/library", label: "内容馆" },
  { href: "/assessment", label: "心理测评" },
  { href: "/xiaoai", label: "小爱心理倾诉" },
  { href: "/consultation", label: "心理咨询" },
];

const XIAOAI_CHILDREN = [
  { href: "/ai", label: "文字倾诉咨询", icon: MessageCircle },
  { href: "/xiaoai-listen", label: "视听倾听陪伴", icon: Headphones },
];

export function PoufNavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { open: openFeedback } = useFeedbackDialog();

  const [searchQuery, setSearchQuery] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [xiaoaiOpen, setXiaoaiOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const userRef = useRef<HTMLDivElement>(null);
  const xiaoaiTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleXiaoaiEnter = () => {
    if (xiaoaiTimer.current) clearTimeout(xiaoaiTimer.current);
    setXiaoaiOpen(true);
  };
  const handleXiaoaiLeave = () => {
    xiaoaiTimer.current = setTimeout(() => setXiaoaiOpen(false), 150);
  };

  useEffect(() => {
    setLoggedIn(isLoggedIn());
    setUser(getStoredUser<UserProfile>());
  }, []);

  // Close the user dropdown on outside click.
  useEffect(() => {
    if (!userOpen) return;
    const handler = (e: MouseEvent) => {
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [userOpen]);

  const handleLogout = () => {
    clearSession();
    setUserOpen(false);
    router.push("/login");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?keyword=${encodeURIComponent(searchQuery.trim())}`);
      setMobileOpen(false);
    }
  };

  const isActive = (href: string) => {
    if (href === "/home") return pathname === "/home";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const navLink = (item: { href: string; label: string }) => (
    <Link
      key={item.href}
      href={item.href}
      onClick={() => setMobileOpen(false)}
      className={`rounded-pill px-3.5 py-2 text-sm font-bold transition-colors ${
        isActive(item.href)
          ? "bg-surface/90 text-ink cushion-field"
          : "text-muted hover:bg-surface/60 hover:text-ink"
      }`}
    >
      {item.label}
    </Link>
  );

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-3 px-5 py-3">
      {/* Logo */}
      <Link href="/home" className="flex shrink-0 items-center gap-2.5">
        <span className="inline-grid size-9 place-items-center rounded-pill bg-mint tone-mint cushion-control">
          <Leaf className="size-5 text-ink" />
        </span>
        <span className="text-xl font-black text-ink tracking-tight">心愈智联</span>
      </Link>

      {/* Nav Menu — desktop */}
      <nav className="hidden items-center gap-1 xl:flex">
        {NAV_ITEMS.map((item) => {
          if (item.label === "小爱心理倾诉") {
            return (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={handleXiaoaiEnter}
                onMouseLeave={handleXiaoaiLeave}
              >
                <Link
                  href={item.href}
                  className={`inline-flex items-center gap-1 rounded-pill px-3.5 py-2 text-sm font-bold transition-colors ${
                    isActive(item.href)
                      ? "bg-surface/90 text-ink cushion-field"
                      : "text-muted hover:bg-surface/60 hover:text-ink"
                  }`}
                >
                  {item.label}
                  <ChevronDown className={`size-3 transition-transform duration-200 ${xiaoaiOpen ? "rotate-180" : ""}`} />
                </Link>
                {xiaoaiOpen && (
                  <div className="absolute left-0 top-full mt-2 w-48 rounded-control bg-surface/95 p-1.5 cushion-card [animation:pouf-fade_200ms_ease]">
                    {XIAOAI_CHILDREN.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        onMouseEnter={handleXiaoaiEnter}
                        className="flex items-center gap-3 rounded-control px-3 py-2.5 text-sm font-bold text-ink transition-colors hover:bg-bg"
                      >
                        <child.icon className="size-4 shrink-0 text-muted" />
                        <span>{child.label}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          }
          return navLink(item);
        })}
      </nav>

      {/* Search — desktop */}
      <form onSubmit={handleSearch} className="hidden md:flex">
        <div className="relative flex">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索文章/课程..."
            className="h-10 w-[200px] rounded-control rounded-r-none bg-surface/70 pl-4 pr-2 text-sm text-ink outline-none transition-shadow placeholder:text-muted/70 xl:w-[240px] cushion-field focus:cushion-field-focus"
          />
          <button
            type="submit"
            aria-label="搜索"
            className="flex items-center justify-center rounded-control rounded-l-none bg-mint tone-mint cushion-control px-3 text-[var(--on-accent)] transition-transform active:[transform:translateY(1px)]"
          >
            <Search className="size-4" />
          </button>
        </div>
      </form>

      {/* User area */}
      <div className="flex items-center gap-2">
        {loggedIn && user ? (
          <>
            {/* Message center */}
            <span className="hidden sm:inline-flex">
              <IconButton
                label="消息"
                icon={<MessageCircle className="size-5" />}
                tone="purple"
                variant="quiet"
                size="sm"
                onClick={() => router.push("/me/messages")}
              />
            </span>

            {/* Feedback button */}
            <button
              type="button"
              onClick={openFeedback}
              className="hidden cursor-pointer rounded-pill px-3 py-2 text-sm font-bold text-muted transition-colors hover:text-ink sm:flex"
            >
              我要反馈
            </button>

            {/* User dropdown */}
            <div className="relative" ref={userRef}>
              <button
                type="button"
                onClick={() => setUserOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={userOpen}
                className="inline-flex cursor-pointer items-center gap-2 rounded-pill bg-surface/70 py-1 pl-1 pr-2.5 transition-colors hover:bg-surface/90 cushion-field"
              >
                {user.headPath ? (
                  <img src={user.headPath} alt="" className="size-7 rounded-full object-cover" />
                ) : (
                  <span className="inline-grid size-7 place-items-center rounded-full bg-purple/25 text-muted">
                    <User className="size-4" />
                  </span>
                )}
                <span className="hidden text-sm font-bold text-ink lg:inline">{user.nickname ?? user.username}</span>
                <ChevronDown className={`size-3 text-muted transition-transform duration-200 ${userOpen ? "rotate-180" : ""}`} />
              </button>

              {userOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-52 rounded-control bg-surface/95 p-1.5 cushion-card [animation:pouf-fade_200ms_ease]">
                  <div className="px-3 py-2.5">
                    <div className="text-sm font-black text-ink">{user.nickname ?? user.username}</div>
                    <div className="text-xs font-bold text-muted">{user.email ?? ""}</div>
                  </div>
                  <div className="mx-2 my-1 h-px bg-ink/10" />
                  {[
                    { href: "/me", label: "个人主页", icon: User },
                    { href: "/me/psychology", label: "我的心理咨询", icon: Heart },
                    { href: "/me/orders", label: "订单管理", icon: ShoppingBag },
                  ].map((it) => (
                    <Link
                      key={it.href}
                      href={it.href}
                      onClick={() => setUserOpen(false)}
                      className="flex items-center gap-3 rounded-control px-3 py-2.5 text-sm font-bold text-ink transition-colors hover:bg-bg"
                    >
                      <it.icon className="size-4 shrink-0 text-muted" />
                      <span>{it.label}</span>
                    </Link>
                  ))}
                  <Link
                    href="/apply"
                    onClick={() => setUserOpen(false)}
                    className="flex items-center gap-3 rounded-control px-3 py-2.5 text-sm font-bold text-ink transition-colors hover:bg-bg"
                  >
                    <Star className="size-4 shrink-0 text-muted" />
                    <span>申请心理咨询师</span>
                  </Link>
                  <div className="mx-2 my-1 h-px bg-ink/10" />
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full cursor-pointer items-center gap-3 rounded-control px-3 py-2.5 text-sm font-bold text-ink transition-colors hover:bg-bg"
                  >
                    <LogOut className="size-4 shrink-0 text-muted" />
                    <span>退出登录</span>
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <Link href="/login">
              <Button tone="purple" variant="quiet" size="sm">登录</Button>
            </Link>
            <Link href="/register" className="hidden sm:block">
              <Button tone="mint" variant="solid" size="sm">注册</Button>
            </Link>
            <Link href="/apply" className="hidden xl:block">
              <Button tone="yellow" variant="solid" size="sm">申请成为咨询师</Button>
            </Link>
          </>
        )}

        {/* Mobile menu */}
        <span className="xl:hidden">
          <IconButton
            label="菜单"
            icon={mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            tone="purple"
            variant="quiet"
            size="sm"
            onClick={() => setMobileOpen((v) => !v)}
          />
        </span>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-ink/30 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="fixed inset-y-0 right-0 z-50 w-72 max-w-[85vw] overflow-y-auto bg-bg p-5 [animation:pouf-sheet-in_260ms_ease]">
            <button
              type="button"
              aria-label="关闭菜单"
              className="mb-4 inline-flex size-9 items-center justify-center rounded-pill bg-surface/70 text-ink hover:bg-surface/90"
              onClick={() => setMobileOpen(false)}
            >
              <X className="size-5" />
            </button>

            <nav className="flex flex-col gap-1.5">
              {NAV_ITEMS.map((item) => {
                if (item.label === "小爱心理倾诉") {
                  return (
                    <div key={item.label} className="flex flex-col gap-1.5">
                      <Link
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={`rounded-control px-4 py-3 text-sm font-bold ${isActive(item.href) ? "bg-surface/90 text-ink cushion-field" : "text-ink hover:bg-surface/60"}`}
                      >
                        {item.label}
                      </Link>
                      {XIAOAI_CHILDREN.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center gap-3 rounded-control px-6 py-2.5 text-sm font-bold text-muted transition-colors hover:bg-surface/60 hover:text-ink"
                        >
                          <child.icon className="size-4 shrink-0" />
                          <span>{child.label}</span>
                        </Link>
                      ))}
                    </div>
                  );
                }
                return navLink(item);
              })}
            </nav>

            <div className="mt-4 border-t border-ink/10 pt-4">
              <form onSubmit={handleSearch} className="flex">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索文章/课程..."
                  className="min-w-0 flex-1 rounded-control rounded-r-none bg-surface/70 px-3 py-2.5 text-sm text-ink outline-none placeholder:text-muted/70 cushion-field"
                />
                <button
                  type="submit"
                  aria-label="搜索"
                  className="rounded-control rounded-l-none bg-mint tone-mint cushion-control px-3 text-[var(--on-accent)]"
                >
                  <Search className="size-4" />
                </button>
              </form>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
