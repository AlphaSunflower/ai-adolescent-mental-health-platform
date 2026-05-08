"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User, FileText, Users, Heart } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import type { LibraryItem } from "@/lib/types";

interface UserHomeData {
  userId: number;
  nickname: string;
  headPath: string;
  signature: string;
  isFollowing: boolean;
  isFollowed: boolean;
  stats: { followCount: number; fanCount: number; articleCount: number; likeCount: number };
  privacy: { allowViewLikes: boolean; allowViewCollections: boolean; allowViewFollowings: boolean; allowViewFans: boolean };
}

export function UserHomePage() {
  const { userId } = useParams<{ userId: string }>();
  const id = Number(userId);
  const [profile, setProfile] = useState<UserHomeData | null>(null);
  const [articles, setArticles] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [home, arts] = await Promise.all([
        api.user.getUserHome(id),
        api.user.getUserArticles(id, { page: 1, size: 10 }),
      ]);
      setProfile(home);
      setArticles(arts.records);
    } catch {
      setProfile(null);
      setArticles([]);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFollow = async () => {
    if (!profile) return;
    const wasFollowing = profile.isFollowing;
    try {
      setProfile({ ...profile, isFollowing: !wasFollowing });
      if (wasFollowing) {
        await api.follow.unfollow(id);
      } else {
        await api.follow.follow(id);
      }
    } catch (err) {
      setProfile({ ...profile, isFollowing: wasFollowing });
      toast.error(err instanceof Error ? err.message : "操作失败");
    }
  };

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

  const stats = profile.stats;
  const canViewFollow = profile.privacy.allowViewFollowings || profile.privacy.allowViewFans;

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
              <img src={profile.headPath} alt="" className="size-20 rounded-full object-cover" />
            ) : (
              <User className="size-10 text-cosmic-sky" />
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white">{profile.nickname}</h1>
            {profile.signature && (
              <p className="mt-1 text-sm text-cosmic-muted">{profile.signature}</p>
            )}
            <div className="mt-3 flex gap-6 text-sm">
              <span className="text-cosmic-muted">
                <span className="font-semibold text-white">{stats.articleCount}</span> 文章
              </span>
              {canViewFollow ? (
                <Link
                  href={`/user/${userId}/follow`}
                  className="text-cosmic-muted hover:text-cosmic-sky transition-colors"
                >
                  <span className="font-semibold text-white">{stats.followCount}</span> 关注
                </Link>
              ) : (
                <span className="text-cosmic-muted">
                  <span className="font-semibold text-white">{stats.followCount}</span> 关注
                </span>
              )}
              {canViewFollow ? (
                <Link
                  href={`/user/${userId}/follow`}
                  className="text-cosmic-muted hover:text-cosmic-sky transition-colors"
                >
                  <span className="font-semibold text-white">{stats.fanCount}</span> 粉丝
                </Link>
              ) : (
                <span className="text-cosmic-muted">
                  <span className="font-semibold text-white">{stats.fanCount}</span> 粉丝
                </span>
              )}
              <span className="text-cosmic-muted">
                <span className="font-semibold text-white">{stats.likeCount}</span> 获赞
              </span>
            </div>
          </div>
          <Button
            variant={profile.isFollowing ? "outline" : "primary"}
            size="sm"
            onClick={handleFollow}
            className="gap-1"
          >
            <Heart className={`size-4 ${profile.isFollowing ? "fill-current" : ""}`} />
            {profile.isFollowing ? "已关注" : "关注"}
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
            <Link key={item.id} href={`/user/${userId}/article/${item.id}`}>
              <div className="cosmic-card group cursor-pointer p-4 transition-all hover:-translate-y-1">
                {item.coverUrl && (
                  <img src={item.coverUrl} alt="" className="mb-3 w-full h-32 object-cover rounded-lg" />
                )}
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
