"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  User, FileText, Star, Heart, ClipboardCheck,
  MessageSquare, Users, MessageCircle, Settings,
  ShoppingBag, Send, ChevronRight
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import type { UserProfile } from "@/lib/types";

const QUICK_LINKS = [
  { href: "/me/info", icon: User, label: "个人资料", color: "text-blue-400" },
  { href: "/me/orders", icon: ShoppingBag, label: "我的订单", color: "text-green-400" },
  { href: "/me/messages", icon: MessageSquare, label: "我的消息", color: "text-yellow-400" },
  { href: "/me/articles", icon: FileText, label: "我的发布", color: "text-purple-400" },
  { href: "/me/publish", icon: Send, label: "发布文章", color: "text-orange-400" },
  { href: "/me/favorites", icon: Star, label: "我的收藏", color: "text-amber-400" },
  { href: "/me/likes", icon: Heart, label: "我的点赞", color: "text-pink-400" },
  { href: "/me/assessments", icon: ClipboardCheck, label: "测评记录", color: "text-cyan-400" },
  { href: "/me/feedback", icon: MessageCircle, label: "意见反馈", color: "text-indigo-400" },
  { href: "/me/psychology", icon: Heart, label: "心理咨询", color: "text-rose-400" },
  { href: "/me/patients", icon: Users, label: "就诊人管理", color: "text-teal-400" },
  { href: "/me/privacy", icon: Settings, label: "隐私设置", color: "text-gray-400" },
];

export function MePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.user.getUserInfo()
      .then(setProfile)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const displayName = profile?.nickname || profile?.username || "用户";

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-white">欢迎回来，{displayName}</h1>
      <p className="mb-8 text-sm text-cosmic-muted">
        {profile?.signature || "探索你的心理健康之旅"}
      </p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {QUICK_LINKS.map((item) => (
          <Link key={item.href} href={item.href}>
            <div className="cosmic-card group flex items-center gap-4 p-4 transition-all duration-300 hover:-translate-y-0.5">
              <div className="rounded-lg bg-white/5 p-2.5">
                <item.icon className={`size-5 ${item.color}`} />
              </div>
              <span className="font-medium text-white group-hover:text-cosmic-sky transition-colors flex-1">
                {item.label}
              </span>
              <ChevronRight className="size-4 text-cosmic-dim transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
