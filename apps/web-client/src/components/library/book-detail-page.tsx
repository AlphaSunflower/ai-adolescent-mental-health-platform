"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Eye, Clock, MessageCircle, BookOpen, ExternalLink, Edit, User } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { api } from "@/lib/api";

type BookDetailData = {
  id: number;
  title: string;
  content: string;
  authorName: string;
  coverUrl: string;
  createTime: string;
  viewCount: number;
  commentCount: number;
  onlineLink: string;
};

type BookComment = {
  id: number;
  content: string;
  nickname: string;
  userAvatar: string;
  createTime: string;
};

export function BookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [book, setBook] = useState<BookDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<BookComment[]>([]);
  const [commentPage, setCommentPage] = useState(1);
  const [commentTotal, setCommentTotal] = useState(0);
  const commentSize = 10;
  const totalCommentPages = Math.max(1, Math.ceil(commentTotal / commentSize));

  // Comment dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchBook = useCallback(async () => {
    setLoading(true);
    try {
      const d = await api.content.bookDetail(Number(id));
      setBook(d);
    } catch {
      toast.error("加载书籍信息失败");
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchComments = useCallback(async (page: number) => {
    try {
      const result = await api.content.bookComments(Number(id), page, commentSize);
      setComments(result.records as BookComment[]);
      setCommentTotal(result.total);
    } catch { /* silently fail */ }
  }, [id]);

  useEffect(() => { fetchBook(); }, [fetchBook]);
  useEffect(() => { fetchComments(commentPage); }, [commentPage, fetchComments]);

  const handleReadOnline = () => {
    if (!book?.onlineLink) {
      toast.warning("暂无在线阅读链接");
      return;
    }
    let url = book.onlineLink.trim();
    if (!/^https?:\/\//i.test(url)) url = "https://" + url;
    window.open(url, "_blank");
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim() || submitting) return;
    setSubmitting(true);
    try {
      await api.content.addBookComment(Number(id), commentText.trim());
      toast.success("评论发表成功");
      setCommentText("");
      setDialogOpen(false);
      setCommentPage(1);
      fetchComments(1);
      fetchBook(); // refresh comment count
    } catch { toast.error("评论发表失败"); } finally { setSubmitting(false); }
  };

  // Skeleton
  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 md:py-12">
        <Skeleton className="mb-6 h-5 w-24" />
        <div className="cosmic-card p-6 md:p-8">
          <div className="flex flex-col gap-6 md:flex-row">
            <Skeleton className="h-[176px] w-[126px] rounded-xl shrink-0" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p className="text-lg text-cosmic-muted">书籍不存在或已下架</p>
        <Link href="/library?tab=books" className="mt-4 inline-block text-cosmic-sky hover:underline">
          返回内容馆
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:py-12">
      {/* Back nav */}
      <Link href="/library?tab=books" className="mb-6 inline-flex items-center gap-1 text-sm text-cosmic-muted hover:text-cosmic-sky transition-colors">
        <ArrowLeft className="size-4" /> 返回书籍列表
      </Link>

      {/* Book info card */}
      <div className="cosmic-card mb-8 p-6 md:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-start">
          {/* Cover */}
          <div className="mx-auto md:mx-0 w-[126px] h-[176px] shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/5">
            {book.coverUrl ? (
              <img src={book.coverUrl} alt={book.title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-cosmic-dim">
                <BookOpen className="size-8" />
                <span className="text-xs">暂无封面</span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h1 className="mb-4 text-2xl font-bold text-white md:text-3xl">{book.title}</h1>

            {/* Meta */}
            <div className="mb-4 flex flex-wrap gap-4 text-sm">
              <span className="inline-flex items-center gap-1 text-cosmic-muted">
                <Eye className="size-4 text-cosmic-dim" />
                浏览：{book.viewCount}
              </span>
              <span className="inline-flex items-center gap-1 text-cosmic-muted">
                <MessageCircle className="size-4 text-cosmic-dim" />
                评论：{book.commentCount}
              </span>
              {book.createTime && (
                <span className="inline-flex items-center gap-1 text-cosmic-muted">
                  <Clock className="size-4 text-cosmic-dim" />
                  发布时间：{book.createTime}
                </span>
              )}
              {book.authorName && (
                <span className="inline-flex items-center gap-1 text-cosmic-muted">
                  <User className="size-4 text-cosmic-dim" />
                  {book.authorName}
                </span>
              )}
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="mb-2 text-sm font-semibold text-white">书籍简介</h3>
              <p className="text-sm leading-relaxed text-cosmic-muted">{book.content || "暂无简介"}</p>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3">
              {book.onlineLink ? (
                <Button onClick={handleReadOnline} className="bg-gradient-to-r from-cosmic-blue/70 to-indigo-500/60 border border-cosmic-blue/30 text-white hover:from-cosmic-blue/80 hover:to-indigo-500/70">
                  <ExternalLink className="mr-1 size-4" /> 在线阅读
                </Button>
              ) : (
                <Button variant="outline" disabled className="text-cosmic-dim">
                  <ExternalLink className="mr-1 size-4" /> 暂无在线阅读链接
                </Button>
              )}
              <Button onClick={() => setDialogOpen(true)} className="bg-gradient-to-r from-green-600/60 to-emerald-500/50 border border-green-500/30 text-white hover:from-green-600/70 hover:to-emerald-500/60">
                <Edit className="mr-1 size-4" /> 发表评论
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Comments section */}
      <div className="cosmic-card p-6 md:p-8">
        <h2 className="mb-6 flex items-center gap-2 text-lg font-semibold text-white border-b border-white/10 pb-4">
          <MessageCircle className="size-5 text-cosmic-sky" />
          读者评论
          <span className="text-sm font-normal text-cosmic-dim">({commentTotal})</span>
        </h2>

        {comments.length === 0 ? (
          <div className="py-12 text-center">
            <MessageCircle className="mx-auto mb-3 size-10 text-cosmic-dim opacity-40" />
            <p className="text-sm text-cosmic-muted mb-4">暂无评论，快来发表第一条评论吧！</p>
            <Button variant="primary" size="sm" onClick={() => setDialogOpen(true)}>发表评论</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((c) => (
              <div key={c.id} className="rounded-lg bg-white/5 p-4 border border-white/5 hover:border-white/10 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar className="size-10 shrink-0">
                    {c.userAvatar ? (
                      <img src={c.userAvatar} alt="" className="size-10 rounded-full object-cover" />
                    ) : (
                      <AvatarFallback className="bg-cosmic-blue/20 text-cosmic-sky">{c.nickname[0] ?? "U"}</AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-white">{c.nickname}</p>
                    <p className="text-xs text-cosmic-dim">{c.createTime}</p>
                  </div>
                </div>
                <p className="text-sm text-cosmic-muted leading-relaxed pl-[52px]">{c.content}</p>
              </div>
            ))}

            {/* Pagination */}
            {totalCommentPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4 border-t border-white/5">
                <Button variant="ghost" size="icon-sm" disabled={commentPage <= 1} onClick={() => setCommentPage((p) => p - 1)}>
                  <ArrowLeft className="size-4" />
                </Button>
                {Array.from({ length: totalCommentPages }).map((_, i) => {
                  const pn = i + 1;
                  return (
                    <Button key={pn} variant={pn === commentPage ? "primary" : "ghost"} size="icon-sm" onClick={() => setCommentPage(pn)} className={pn === commentPage ? "" : "text-cosmic-dim hover:text-white"}>
                      {pn}
                    </Button>
                  );
                })}
                <Button variant="ghost" size="icon-sm" disabled={commentPage >= totalCommentPages} onClick={() => setCommentPage((p) => p + 1)}>
                  <svg className="size-4 rotate-180" viewBox="0 0 24 24"><path fill="currentColor" d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Comment Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="!max-w-md">
          <DialogTitle>发表评论</DialogTitle>
          <div className="space-y-4">
            <p className="text-sm text-cosmic-muted">书籍：{book.title}</p>
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="请输入您的评论..."
              maxLength={500}
              rows={4}
              className="cosmic-input w-full rounded-lg px-3 py-2 text-sm resize-none"
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-cosmic-dim">{commentText.length}/500</span>
              <div className="flex gap-2">
                <DialogClose asChild>
                  <Button variant="outline" size="sm">取消</Button>
                </DialogClose>
                <Button variant="primary" size="sm" onClick={handleSubmitComment} disabled={!commentText.trim() || submitting}>
                  {submitting ? "发表中..." : "发表评论"}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
