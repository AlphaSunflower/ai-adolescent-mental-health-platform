"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search, User, LogOut, MessageCircle, FileText, Settings,
  ShoppingBag, Heart, Menu, X, Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { isLoggedIn, getStoredUser, clearSession } from "@/lib/session";
import { api } from "@/lib/api";
import { type UserProfile } from "@/lib/types";
import { useState, useEffect } from "react";

const NAV_ITEMS = [
  { href: "/home", label: "首页" },
  { href: "/library", label: "心理文章" },
  { href: "/library?tab=courses", label: "心理课程" },
  { href: "/assessment", label: "心理测评" },
  { href: "/consultation", label: "心理咨询" },
  { href: "/ai", label: "线上AI咨询" },
  { href: "/library?tab=books", label: "心理书籍" },
  { href: "/xiaoai-listen", label: "小爱倾听" },
];

export function NavBar() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setLoggedIn(isLoggedIn());
    setUser(getStoredUser<UserProfile>());
  }, []);

  const handleLogout = () => {
    clearSession();
    router.push("/login");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?keyword=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-3 bg-transparent px-5 py-3 text-cosmic-header">
      {/* Logo */}
      <Link href="/home" className="flex shrink-0 items-center gap-3">
        <span
          className="text-[28px] font-bold"
          style={{
            background: "linear-gradient(to right, #409EFF, #36cfc9)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          心愈智联
        </span>
      </Link>

      {/* Nav Menu — desktop */}
      <nav className="hidden items-center gap-0.5 xl:flex">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href + item.label}
            href={item.href}
            className="rounded-lg px-3 py-2 text-sm transition-colors hover:bg-white/10 hover:text-cosmic-nav-hover"
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Search — desktop */}
      <form onSubmit={handleSearch} className="hidden md:flex">
        <div className="relative flex">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索文章/课程..."
            className="cosmic-input h-9 w-[200px] rounded-lg rounded-r-none bg-white/10 pl-4 pr-2 text-sm placeholder:text-cosmic-dim xl:w-[240px]"
          />
          <button
            type="submit"
            className="flex items-center justify-center rounded-lg rounded-l-none bg-cosmic-blue/60 px-3 text-white hover:bg-cosmic-blue/80 transition-colors"
          >
            <Search className="size-4" />
          </button>
        </div>
      </form>

      {/* User area */}
      <div className="flex items-center gap-2">
        {loggedIn && user ? (
          <>
            {/* Message badge */}
            <Link
              href="/me/messages"
              className="relative hidden text-cosmic-dim hover:text-cosmic-gold transition-colors sm:flex"
              title="消息"
            >
              <MessageCircle className="size-5" />
              <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                0
              </span>
            </Link>

            {/* Feedback link */}
            <Link
              href="/me/feedback"
              className="hidden text-sm text-cosmic-dim hover:text-cosmic-gold transition-colors sm:flex"
            >
              我要反馈
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 cursor-pointer">
                <Avatar className="size-8 ring-2 ring-transparent hover:ring-cosmic-gold/50 transition-all">
                  {user.headPath ? (
                    <img src={user.headPath} alt="" className="size-8 rounded-full object-cover" />
                  ) : (
                    <AvatarFallback className="bg-cosmic-blue/20 text-cosmic-sky">
                      <User className="size-4" />
                    </AvatarFallback>
                  )}
                </Avatar>
                <span className="hidden text-sm text-cosmic-header lg:inline">
                  {user.nickname ?? user.username}
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-4 py-2 text-sm">
                  <div className="font-medium text-white">{user.nickname ?? user.username}</div>
                  <div className="text-xs text-cosmic-muted">{user.email ?? ""}</div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/me")}>
                  <User className="size-4" /> 个人主页
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/me/psychology")}>
                  <Heart className="size-4" /> 我的心理咨询
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/me/orders")}>
                  <ShoppingBag className="size-4" /> 订单管理
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/apply")}>
                  <Star className="size-4" />
                  <span className="text-cosmic-gold">申请心理咨询师</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="size-4" /> 退出登录
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          <>
            <Link href="/login">
              <Button variant="ghost" size="sm">登录</Button>
            </Link>
            <Link href="/register" className="hidden sm:block">
              <Button variant="primary" size="sm">注册</Button>
            </Link>
            <Link href="/apply" className="hidden xl:block">
              <Button
                size="sm"
                className="min-h-0 rounded-full bg-gradient-to-r from-[#FFE9A7] to-[#FFD54F] px-5 py-1.5 text-xs font-semibold text-[#1A2A3A] shadow-[0_2px_8px_rgba(255,233,167,0.3)]"
              >
                申请成为心理咨询师
              </Button>
            </Link>
          </>
        )}

        {/* Mobile menu */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon-sm" className="xl:hidden">
              {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-64 pt-12">
            <nav className="flex flex-col gap-1">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href + item.label}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-4 py-3 text-sm text-cosmic-header hover:bg-white/10 transition-colors"
                >
                  {item.label}
                </Link>
              ))}
              <div className="mt-4 border-t border-white/10 pt-4">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSearch(e);
                    setMobileOpen(false);
                  }}
                  className="flex"
                >
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="搜索文章/课程..."
                    className="cosmic-input flex-1 rounded-lg rounded-r-none bg-white/10 px-3 py-2 text-sm"
                  />
                  <button
                    type="submit"
                    className="rounded-lg rounded-l-none bg-cosmic-blue/60 px-3 text-white"
                  >
                    <Search className="size-4" />
                  </button>
                </form>
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
