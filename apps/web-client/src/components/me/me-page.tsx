"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  User, Settings, ShoppingBag, MessageSquare, Heart, FileText,
  ClipboardCheck, Users, Star, Send, ChevronRight, Phone,
  LogOut, Edit3
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { clearSession } from "@/lib/session";
import type { UserProfile } from "@/lib/types";

const MENU_GROUPS = [
  {
    title: "我的服务",
    items: [
      { href: "/me/orders", icon: ShoppingBag, label: "我的订单", desc: "查看咨询预约订单" },
      { href: "/me/messages", icon: MessageSquare, label: "我的消息", desc: "查看消息通知" },
      { href: "/me/psychology", icon: Heart, label: "我的心理", desc: "心理健康档案" },
      { href: "/me/patients", icon: Users, label: "就诊人管理", desc: "管理就诊人信息" },
    ],
  },
  {
    title: "我的内容",
    items: [
      { href: "/me/articles", icon: FileText, label: "我的文章", desc: "管理已发布的文章" },
      { href: "/me/publish", icon: Send, label: "发布文章", desc: "分享你的故事与经验" },
      { href: "/me/favorites", icon: Star, label: "我的收藏", desc: "收藏的文章与内容" },
      { href: "/me/likes", icon: Heart, label: "我的点赞", desc: "点赞过的内容" },
    ],
  },
  {
    title: "测评与记录",
    items: [
      { href: "/me/assessments", icon: ClipboardCheck, label: "测评记录", desc: "查看历史测评结果" },
      { href: "/me/feedback", icon: MessageSquare, label: "意见反馈", desc: "帮助我们做得更好" },
    ],
  },
  {
    title: "社交",
    items: [
      { href: "/me/follow", icon: Users, label: "关注管理", desc: "管理关注和粉丝" },
      { href: "/me/info", icon: Settings, label: "个人资料", desc: "编辑个人资料信息" },
      { href: "/me/privacy", icon: Settings, label: "隐私设置", desc: "管理隐私与安全" },
    ],
  },
];

export function MePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.user.getUserInfo()
      .then(setProfile)
      .catch(() => { /* guest mode, no profile */ })
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    clearSession();
    toast.success("已退出登录");
    router.push("/login");
  };

  const displayName = profile?.nickname || profile?.username || "用户";
  const roleLabel = profile?.role === "psychologist" ? "咨询师" : profile?.role === "admin" ? "管理员" : "用户";

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:py-12">
      {/* Profile Card */}
      <div className="cosmic-card mb-8 overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-cosmic-blue/30 via-purple-400/20 to-cosmic-gold/20" />
        <div className="-mt-12 px-6 pb-6">
          <div className="flex items-end gap-4">
            <div className="size-20 rounded-full border-4 border-cosmic-navy-mid bg-cosmic-blue/20 flex items-center justify-center">
              {loading ? (
                <Skeleton className="size-20 rounded-full" />
              ) : profile?.headPath ? (
                <img src={profile.headPath} alt="avatar" className="size-20 rounded-full object-cover" />
              ) : (
                <User className="size-10 text-cosmic-sky" />
              )}
            </div>
            <div className="flex-1 pb-1">
              {loading ? (
                <>
                  <Skeleton className="mb-1 h-6 w-32" />
                  <Skeleton className="h-4 w-20" />
                </>
              ) : (
                <>
                  <h1 className="text-xl font-bold text-white">{displayName}</h1>
                  <p className="text-sm text-cosmic-muted">{roleLabel}{profile?.signature ? ` · ${profile.signature}` : ""}</p>
                </>
              )}
            </div>
            <Link href="/me/info">
              <Button variant="outline" size="xs" className="gap-1">
                <Edit3 className="size-3" />
                编辑资料
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Menu Groups */}
      <div className="space-y-6">
        {MENU_GROUPS.map((group) => (
          <div key={group.title}>
            <h2 className="mb-3 text-sm font-semibold text-cosmic-dim uppercase tracking-wider">
              {group.title}
            </h2>
            <div className="grid gap-2 sm:grid-cols-2">
              {group.items.map((item) => (
                <Link key={item.href} href={item.href}>
                  <div className="cosmic-card group flex items-center gap-4 p-4 transition-all duration-300 hover:-translate-y-0.5">
                    <div className="rounded-lg bg-white/5 p-2.5">
                      <item.icon className="size-5 text-cosmic-sky" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-white group-hover:text-cosmic-nav-hover transition-colors">
                        {item.label}
                      </h3>
                      <p className="text-xs text-cosmic-muted">{item.desc}</p>
                    </div>
                    <ChevronRight className="size-4 text-cosmic-dim transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Logout */}
      <div className="mt-8">
        <Button variant="outline" className="w-full text-cosmic-muted hover:text-white" onClick={handleLogout}>
          <LogOut className="mr-2 size-4" />
          退出登录
        </Button>
      </div>
    </div>
  );
}
