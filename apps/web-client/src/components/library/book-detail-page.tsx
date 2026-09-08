"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Eye, Clock, MessageCircle, BookOpen, ExternalLink, Edit, User } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/pouf/Skeleton";
import { Button, IconButton } from "@/components/pouf/Button";
import { Avatar, AvatarFallback } from "@/components/pouf/Avatar";
import { Dialog, DialogContent, DialogTitle, DialogClose } from "@/components/pouf/Dialog";
import { Card } from "@/components/pouf/Card";
import { Textarea } from "@/components/pouf/Textarea";
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
        <Card className="p-6 md:p-8">
          <div className="flex flex-col gap-6 md:flex-row">
            <Skeleton className="h-[176px] w-[126px] rounded-xl shrink-0" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p className="text-lg text-muted">书籍不存在或已下架</p>
        <Link href="/library?tab=books" className="mt-4 inline-block text-blue hover:underline">
          返回内容馆
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:py-12">
      {/* Back nav */}
      <Link href="/library?tab=books" className="mb-6 inline-flex items-center gap-1 text-sm text-muted hover:text-blue transition-colors">
        <ArrowLeft className="size-4" /> 返回书籍列表
      </Link>

      {/* Book info card */}
      <Card className="mb-8 p-6 md:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-start">
          {/* Cover */}
          <div className="mx-auto md:mx-0 w-[126px] h-[176px] shrink-0 overflow-hidden rounded-xl border border-[rgba(201,168,255,0.3)] bg-purple/10">
            {book.coverUrl ? (
              <img src={book.coverUrl} alt={book.title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted/70">
                <BookOpen className="size-8" />
                <span className="text-xs">暂无封面</span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h1 className="mb-4 text-2xl font-black text-ink md:text-3xl">{book.title}</h1>

            {/* Meta */}
            <div className="mb-4 flex flex-wrap gap-4 text-sm">
              <span className="inline-flex items-center gap-1 text-muted">
                <Eye className="size-4 text-muted/70" />
                浏览：{book.viewCount}
              </span>
              <span className="inline-flex items-center gap-1 text-muted">
                <MessageCircle className="size-4 text-muted/70" />
                评论：{book.commentCount}
              </span>
              {book.createTime && (
                <span className="inline-flex items-center gap-1 text-muted">
                  <Clock className="size-4 text-muted/70" />
                  发布时间：{book.createTime}
                </span>
              )}
              {book.authorName && (
                <span className="inline-flex items-center gap-1 text-muted">
                  <User className="size-4 text-muted/70" />
                  {book.authorName}
                </span>
              )}
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="mb-2 text-sm font-bold text-ink">书籍简介</h3>
              <p className="text-sm leading-relaxed text-muted">{book.content || "暂无简介"}</p>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3">
              {book.onlineLink ? (
                <Button tone="purple" variant="solid" size="md" onClick={handleReadOnline}>
                  <ExternalLink className="mr-1 size-4" /> 在线阅读
                </Button>
              ) : (
                <Button tone="purple" variant="quiet" disabled>
                  <ExternalLink className="mr-1 size-4" /> 暂无在线阅读链接
                </Button>
              )}
              <Button tone="purple" variant="quiet" onClick={() => setDialogOpen(true)}>
                <Edit className="mr-1 size-4" /> 发表评论
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Comments section */}
      <Card className="p-6 md:p-8">
        <h2 className="mb-6 flex items-center gap-2 text-lg font-bold text-ink border-b border-[rgba(201,168,255,0.3)] pb-4">
          <MessageCircle className="size-5 text-blue" />
          读者评论
          <span className="text-sm font-normal text-muted/70">({commentTotal})</span>
        </h2>

        {comments.length === 0 ? (
          <div className="py-12 text-center">
            <MessageCircle className="mx-auto mb-3 size-10 text-muted/70 opacity-40" />
            <p className="text-sm text-muted mb-4">暂无评论，快来发表第一条评论吧！</p>
            <Button tone="purple" variant="solid" size="sm" onClick={() => setDialogOpen(true)}>发表评论</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((c) => (
              <div key={c.id} className="rounded-control bg-purple/10 p-4 border border-[rgba(201,168,255,0.2)] hover:border-[rgba(201,168,255,0.4)] transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar className="size-10 shrink-0">
                    {c.userAvatar ? (
                      <img src={c.userAvatar} alt="" className="size-10 rounded-full object-cover" />
                    ) : (
                      <AvatarFallback className="bg-purple/20 text-blue">{c.nickname[0] ?? "U"}</AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-ink">{c.nickname}</p>
                    <p className="text-xs text-muted/70">{c.createTime}</p>
                  </div>
                </div>
                <p className="text-sm text-muted leading-relaxed pl-[52px]">{c.content}</p>
              </div>
            ))}

            {/* Pagination */}
            {totalCommentPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4 border-t border-[rgba(201,168,255,0.2)]">
                <IconButton icon={<ArrowLeft className="size-4" />} label="上一页" size="sm" variant="quiet" disabled={commentPage <= 1} onClick={() => setCommentPage((p) => p - 1)} />
                {Array.from({ length: totalCommentPages }).map((_, i) => {
                  const pn = i + 1;
                  return (
                    <Button key={pn} tone="purple" variant={pn === commentPage ? "solid" : "quiet"} size="sm" onClick={() => setCommentPage(pn)}>
                      {pn}
                    </Button>
                  );
                })}
                <IconButton icon={<svg className="size-4 rotate-180" viewBox="0 0 24 24"><path fill="currentColor" d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>} label="下一页" size="sm" variant="quiet" disabled={commentPage >= totalCommentPages} onClick={() => setCommentPage((p) => p + 1)} />
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Comment Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogTitle>发表评论</DialogTitle>
          <div className="space-y-4">
            <p className="text-sm text-muted">书籍：{book.title}</p>
            <Textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="请输入您的评论..."
              maxLength={500}
              rows={4}
              className="resize-none"
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted/70">{commentText.length}/500</span>
              <div className="flex gap-2">
                <DialogClose>取消</DialogClose>
                <Button tone="purple" variant="solid" size="sm" onClick={handleSubmitComment} disabled={!commentText.trim() || submitting}>
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
