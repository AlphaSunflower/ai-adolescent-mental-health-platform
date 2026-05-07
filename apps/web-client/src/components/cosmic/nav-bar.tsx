"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, User, LogOut, MessageCircle, FileText, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { isLoggedIn, getStoredUser, clearSession } from "@/lib/session";
import { type UserProfile } from "@/lib/types";
import { useState, useEffect } from "react";

const NAV_ITEMS = [
  { href: "/home", label: "首页" },
  { href: "/ai", label: "AI 咨询" },
  { href: "/consultation", label: "心理咨询" },
  { href: "/assessment", label: "心理测评" },
  { href: "/library", label: "内容馆" },
];

export function NavBar() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);

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
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 bg-transparent px-5 py-3 text-cosmic-header">
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
      <nav className="hidden items-center gap-1 lg:flex">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-lg px-4 py-2 text-sm transition-colors hover:bg-white/10 hover:text-cosmic-nav-hover"
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Search — desktop */}
      <form onSubmit={handleSearch} className="hidden md:flex">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索文章、课程..."
            className="cosmic-input h-9 w-52 rounded-lg bg-white/10 pl-4 pr-10 text-sm placeholder:text-cosmic-dim"
          />
          <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-cosmic-dim hover:text-cosmic-gold">
            <Search className="size-4" />
          </button>
        </div>
      </form>

      {/* User area */}
      <div className="flex items-center gap-3">
        {loggedIn && user ? (
          <>
            <Link href="/me/messages" className="hidden text-cosmic-dim hover:text-cosmic-gold sm:block">
              <MessageCircle className="size-5" />
            </Link>
            <Link href="/me/feedback" className="hidden text-cosmic-dim hover:text-cosmic-gold sm:block">
              <FileText className="size-5" />
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Avatar className="size-9 cursor-pointer ring-2 ring-transparent hover:ring-cosmic-gold/50">
                  <AvatarFallback>
                    <User className="size-4" />
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="px-4 py-2 text-sm">
                  <div className="font-medium text-white">{user.nickname ?? user.username}</div>
                  <div className="text-xs text-cosmic-muted">{user.email}</div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/me")}>
                  <User className="size-4" /> 个人中心
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/me/orders")}>
                  我的订单
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/apply")}>
                  申请咨询师
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
            <Link href="/apply" className="hidden lg:block">
              <Button
                size="sm"
                className="min-h-0 rounded-full bg-gradient-to-r from-[#FFE9A7] to-[#FFD54F] px-5 py-1.5 text-xs font-semibold text-[#1A2A3A] shadow-[0_2px_8px_rgba(255,233,167,0.3)]"
              >
                申请成为心理咨询师
              </Button>
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
