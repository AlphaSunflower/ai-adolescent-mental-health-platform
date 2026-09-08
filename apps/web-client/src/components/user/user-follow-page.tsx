"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User, UserPlus, UserMinus, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Button, IconButton } from "@/components/pouf/Button";
import { Skeleton } from "@/components/pouf/Skeleton";
import { Card } from "@/components/pouf/Card";
import { api } from "@/lib/api";
import type { FollowUser } from "@/lib/types";

type Tab = "followings" | "followers";

export function UserFollowPage() {
  const { userId } = useParams<{ userId: string }>();
  const id = Number(userId);
  const [tab, setTab] = useState<Tab>("followings");
  const [followings, setFollowings] = useState<FollowUser[]>([]);
  const [followers, setFollowers] = useState<FollowUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchData = useCallback(
    async (p: number) => {
      setLoading(true);
      try {
        if (tab === "followings") {
          const result = await api.follow.userFollowings(id, { page: p, size: 20 });
          setFollowings(result.records);
          setTotal(result.total);
        } else {
          const result = await api.follow.userFollowers(id, { page: p, size: 20 });
          setFollowers(result.records);
          setTotal(result.total);
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "加载失败");
      }
      setLoading(false);
    },
    [id, tab],
  );

  useEffect(() => {
    setPage(1);
    fetchData(1);
  }, [fetchData]);

  const handleFollow = async (targetId: number, isFollowing: boolean) => {
    try {
      if (isFollowing) {
        await api.follow.unfollow(targetId);
        toast.success("已取消关注");
      } else {
        await api.follow.follow(targetId);
        toast.success("已关注");
      }
      fetchData(page);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "操作失败");
    }
  };

  const list = tab === "followings" ? followings : followers;
  const totalPages = Math.ceil(total / 20);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 md:py-12">
      <Link
        href={`/user/${userId}`}
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted hover:text-blue transition-colors"
      >
        <ArrowLeft className="size-4" /> 返回用户主页
      </Link>

      <h1 className="mb-6 text-2xl font-black text-ink">关注列表</h1>

      {/* Tabs */}
      <Card className="mb-6 flex p-1">
        {(["followings", "followers"] as const).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setPage(1); }}
            className={`flex-1 rounded-control py-2 text-sm font-bold transition-colors ${
              tab === t ? "bg-purple/20 text-purple" : "text-muted/70 hover:text-ink"
            }`}
          >
            {t === "followings" ? "TA 的关注" : "TA 的粉丝"}
          </button>
        ))}
      </Card>

      {/* List */}
      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="p-4 flex items-center gap-4">
              <Skeleton className="size-11 rounded-full shrink-0" />
              <div className="flex-1">
                <Skeleton className="h-4 w-20 mb-1" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-8 w-20 rounded-lg" />
            </Card>
          ))
        ) : list.length === 0 ? (
          <div className="py-16 text-center">
            <User className="mx-auto mb-3 size-10 text-muted opacity-40" />
            <p className="text-muted">{tab === "followings" ? "暂无关注" : "暂无粉丝"}</p>
          </div>
        ) : (
          list.map((user) => (
            <Card key={user.userId} className="p-4 flex items-center gap-4">
              <Link href={`/user/${user.userId}`} className="size-11 rounded-full bg-purple/20 flex items-center justify-center shrink-0">
                {user.headPath ? (
                  <img src={user.headPath} alt="" className="size-11 rounded-full object-cover" />
                ) : (
                  <User className="size-5 text-blue" />
                )}
              </Link>
              <div className="flex-1 min-w-0">
                <Link href={`/user/${user.userId}`} className="text-sm font-bold text-ink hover:text-blue transition-colors">
                  {user.nickname}
                </Link>
                {user.signature && <p className="text-xs text-muted/70 truncate mt-0.5">{user.signature}</p>}
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/user/${user.userId}`}>
                  <IconButton icon={<ExternalLink className="size-4" />} label="访问主页" variant="quiet" size="sm" />
                </Link>
                {tab === "followings" ? (
                  <Button
                    variant="quiet"
                    size="sm"
                    onClick={() => handleFollow(user.userId, true)}
                  >
                    <UserMinus className="size-3.5" /> 取消关注
                  </Button>
                ) : (
                  <Button
                    variant={user.isFollowed ? "quiet" : "solid"}
                    size="sm"
                    onClick={() => handleFollow(user.userId, user.isFollowed)}
                  >
                    {user.isFollowed ? (
                      <><UserMinus className="size-3.5" /> 已关注</>
                    ) : (
                      <><UserPlus className="size-3.5" /> 关注</>
                    )}
                  </Button>
                )}
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <Button
            variant="quiet"
            size="sm"
            disabled={page <= 1}
            onClick={() => { const p = page - 1; setPage(p); fetchData(p); }}
          >
            上一页
          </Button>
          <span className="text-sm text-muted/70 px-3">
            {page} / {totalPages}
          </span>
          <Button
            variant="quiet"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => { const p = page + 1; setPage(p); fetchData(p); }}
          >
            下一页
          </Button>
        </div>
      )}
    </div>
  );
}
