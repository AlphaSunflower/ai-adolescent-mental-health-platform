"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { FollowUser } from "@ai-adolescent-mental-health/domain";

export function FollowPage() {
  const [tab, setTab] = useState("followings");
  const [items, setItems] = useState<FollowUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setLoading(true);
    const p = tab === "followings"
      ? api.follow.myFollowings({ page, size: 10 })
      : api.follow.myFollowers({ page, size: 10 });
    p.then((r) => { setItems(r.records); setTotal(r.total); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [tab, page]);

  const handleTabChange = (val: string) => {
    setTab(val);
    setPage(1);
  };

  const handleUnfollow = async (userId: number) => {
    if (!confirm("确定要取消关注吗？")) return;
    try {
      await api.follow.unfollow(userId);
      toast.success("已取消关注");
      setItems((prev) => prev.filter((u) => u.userId !== userId));
      setTotal((t) => t - 1);
    } catch {
      toast.error("操作失败");
    }
  };

  const handleFollow = async (userId: number) => {
    try {
      await api.follow.follow(userId);
      toast.success("已关注");
      setItems((prev) => prev.map((u) => u.userId === userId ? { ...u, isFollowing: true } : u));
    } catch {
      toast.error("操作失败");
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold text-white">我的关注</h1>
      <Tabs value={tab} onValueChange={handleTabChange}>
        <TabsList className="mb-6">
          <TabsTrigger value="followings">我的关注</TabsTrigger>
          <TabsTrigger value="followers">我的粉丝</TabsTrigger>
        </TabsList>
        <TabsContent value={tab}>
          {items.length === 0 ? (
            <div className="py-20 text-center text-cosmic-muted">
              {tab === "followings" ? "还没有关注任何人" : "还没有粉丝"}
            </div>
          ) : (
            <div className="space-y-2">
              {items.map((user) => (
                <div key={user.userId} className="cosmic-card flex items-center gap-4 p-4">
                  <div className="size-[50px] rounded-full overflow-hidden bg-cosmic-blue/20 shrink-0">
                    {user.headPath ? (
                      <img src={user.headPath} alt="" className="size-[50px] object-cover" />
                    ) : (
                      <div className="size-[50px] flex items-center justify-center text-xl font-bold text-cosmic-sky">
                        {user.nickname?.[0] ?? "?"}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white">{user.nickname}</p>
                    {user.signature && (
                      <p className="text-xs text-cosmic-dim truncate">{user.signature}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/user/${user.userId}`}>
                      <Button variant="ghost" size="xs">访问主页</Button>
                    </Link>
                    {tab === "followings" ? (
                      <Button variant="ghost" size="xs" className="text-red-400" onClick={() => handleUnfollow(user.userId)}>
                        取消关注
                      </Button>
                    ) : (
                      !user.isFollowing && (
                        <Button variant="primary" size="xs" onClick={() => handleFollow(user.userId)}>
                          回关
                        </Button>
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          {total > 10 && (
            <div className="mt-4 flex justify-center gap-2">
              <Button variant="ghost" size="icon-sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>‹</Button>
              <span className="self-center text-sm text-cosmic-dim">{page} / {Math.ceil(total / 10)}</span>
              <Button variant="ghost" size="icon-sm" disabled={page * 10 >= total} onClick={() => setPage((p) => p + 1)}>›</Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
