"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  User, FileText, Lock, Star, Heart, ClipboardCheck, MessageSquare,
  Users, MessageCircle, LogOut
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { clearSession, getStoredUser } from "@/lib/session";
import type { UserProfile } from "@/lib/types";

const MENU_ITEMS = [
  { href: "/me/info", icon: User, label: "个人信息中心" },
  { href: "/me/articles", icon: FileText, label: "我的发布" },
  { href: "/me/privacy", icon: Lock, label: "隐私设置" },
  { href: "/me/favorites", icon: Star, label: "我的收藏" },
  { href: "/me/likes", icon: Heart, label: "我的点赞" },
  { href: "/me/assessments", icon: ClipboardCheck, label: "我的测评记录" },
  { href: "/me/feedback", icon: MessageSquare, label: "我的反馈" },
  { href: "/me/patients", icon: Users, label: "就诊人病历管理" },
  { href: "/me/psychology", icon: MessageCircle, label: "我的心理咨询" },
];

export function MeLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ followCount: 0, fanCount: 0, likeCount: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const p = await api.user.getUserInfo();
        setProfile(p);
        const home = await api.user.getUserHome(p.id);
        const homeStats = (home as Record<string, unknown>).stats as Record<string, unknown> | undefined;
        setStats({
          followCount: (homeStats?.followCount as number) ?? 0,
          fanCount: (homeStats?.fanCount as number) ?? 0,
          likeCount: (homeStats?.likeCount as number) ?? 0,
        });
      } catch {
        // keep defaults
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const displayName = profile?.nickname || profile?.username || "用户";

  const handleLogout = () => {
    clearSession();
    router.push("/login");
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:py-12">
      <div className="flex gap-6">
        {/* Sidebar */}
        <aside className="hidden md:block w-[240px] shrink-0">
          <div className="cosmic-card sticky top-24 overflow-hidden">
            {/* User info header */}
            <div className="px-4 pt-6 pb-4 text-center border-b border-white/10">
              <Link href="/me/info" className="inline-block">
                <Avatar className="size-16 mx-auto ring-2 ring-cosmic-gold/30">
                  {profile?.headPath ? (
                    <img src={profile.headPath} alt="" className="size-16 rounded-full object-cover" />
                  ) : (
                    <AvatarFallback className="bg-cosmic-blue/20 text-cosmic-sky text-2xl">
                      {loading ? <Skeleton className="size-16 rounded-full" /> : displayName[0]}
                    </AvatarFallback>
                  )}
                </Avatar>
              </Link>
              <Link href="/me/info" className="mt-3 block text-sm font-semibold text-white hover:text-cosmic-sky transition-colors">
                {loading ? <Skeleton className="h-5 w-20 mx-auto" /> : displayName}
              </Link>

              {/* Stats row */}
              <div className="mt-3 flex items-center justify-center gap-0 text-xs">
                <Link href="/me/followings" className="flex flex-col items-center px-2 hover:text-cosmic-sky transition-colors text-cosmic-muted">
                  <span className="font-bold text-white text-sm">{stats.followCount}</span>
                  <span>关注</span>
                </Link>
                <span className="text-cosmic-dim mx-1">|</span>
                <Link href="/me/fans" className="flex flex-col items-center px-2 hover:text-cosmic-sky transition-colors text-cosmic-muted">
                  <span className="font-bold text-white text-sm">{stats.fanCount}</span>
                  <span>粉丝</span>
                </Link>
                <span className="text-cosmic-dim mx-1">|</span>
                <span className="flex flex-col items-center px-2 text-cosmic-muted">
                  <span className="font-bold text-white text-sm">{stats.likeCount}</span>
                  <span>获赞</span>
                </span>
              </div>
            </div>

            {/* Menu */}
            <nav className="py-2">
              {MENU_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                      isActive
                        ? "bg-cosmic-blue/15 text-cosmic-sky border-r-2 border-cosmic-sky"
                        : "text-cosmic-muted hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <item.icon className="size-4 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Logout */}
            <div className="border-t border-white/10 p-3">
              <Button variant="ghost" size="sm" className="w-full text-cosmic-dim hover:text-white text-xs" onClick={handleLogout}>
                <LogOut className="mr-2 size-3" />
                退出登录
              </Button>
            </div>
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
