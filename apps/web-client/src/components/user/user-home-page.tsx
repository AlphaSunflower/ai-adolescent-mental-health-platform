"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User, FileText, Users, Heart, MapPin } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import type { UserProfile, LibraryItem } from "@/lib/types";

export function UserHomePage() {
  const { userId } = useParams<{ userId: string }>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [articles, setArticles] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const info = await api.user.getUserInfo();
        // For now, show current user's profile; when dedicated user home API is available, use that
        setProfile(info);
      } catch {
        setProfile(null);
      }
      try {
        const result = await api.content.communityArticles();
        setArticles(result.records.slice(0, 6));
      } catch {
        setArticles([]);
      }
      setLoading(false);
    };
    fetchData();
  }, [userId]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 md:py-12">
        <Skeleton className="mb-4 h-5 w-24" />
        <div className="cosmic-card mb-8 p-6">
          <Skeleton className="mb-3 size-20 rounded-full" />
          <Skeleton className="mb-2 h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center">
        <p className="text-lg text-cosmic-muted">用户不存在</p>
        <Link href="/" className="mt-4 inline-block text-cosmic-sky hover:underline">
          返回首页
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:py-12">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1 text-sm text-cosmic-muted hover:text-cosmic-sky transition-colors"
      >
        <ArrowLeft className="size-4" />
        返回首页
      </Link>

      {/* Profile Header */}
      <div className="cosmic-card mb-8 p-6">
        <div className="flex items-start gap-5">
          <div className="size-20 rounded-full bg-cosmic-blue/20 flex items-center justify-center">
            {profile.headPath ? (
              <img src={profile.headPath} alt="avatar" className="size-20 rounded-full object-cover" />
            ) : (
              <User className="size-10 text-cosmic-sky" />
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white">{profile.nickname || profile.username}</h1>
            {profile.signature && (
              <p className="mt-1 text-sm text-cosmic-muted">{profile.signature}</p>
            )}
            <div className="mt-3 flex gap-6 text-sm">
              <span className="text-cosmic-muted">
                <span className="font-semibold text-white">{articles.length}</span> 文章
              </span>
              <span className="text-cosmic-muted">
                <span className="font-semibold text-white">0</span> 关注
              </span>
              <span className="text-cosmic-muted">
                <span className="font-semibold text-white">0</span> 粉丝
              </span>
            </div>
          </div>
          <Button variant="outline" size="sm" className="gap-1">
            <Heart className="size-4" /> 关注
          </Button>
        </div>
      </div>

      {/* Articles */}
      <h2 className="cosmic-page-title mb-4 text-lg">发布的文章</h2>
      {articles.length === 0 ? (
        <div className="cosmic-card p-12 text-center">
          <FileText className="mx-auto mb-3 size-10 text-cosmic-dim opacity-40" />
          <p className="text-cosmic-muted">暂无文章</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {articles.map((item) => (
            <Link key={item.id} href={`/library/article/${item.id}`}>
              <div className="cosmic-card group cursor-pointer p-4 transition-all hover:-translate-y-1">
                <span className="cosmic-tag mb-2 inline-block text-xs">{item.tag}</span>
                <h3 className="mb-1 font-semibold text-white group-hover:text-cosmic-nav-hover transition-colors">
                  {item.title}
                </h3>
                <p className="line-clamp-2 text-sm text-cosmic-muted">{item.summary}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
