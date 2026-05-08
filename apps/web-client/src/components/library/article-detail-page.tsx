"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  ArrowLeft, Eye, Clock, User, ThumbsUp, ThumbsDown, Star, Share2,
  MessageCircle, ChevronLeft, ChevronRight, Menu, Send, X
} from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { api } from "@/lib/api";
import type { ArticleDetail } from "@/lib/types";

type TocItem = { id: string; text: string; level: number };

type Comment = {
  id: number;
  content: string;
  nickname: string;
  headPath: string;
  createTime: string;
  likeCount: number;
  liked: boolean;
  userId: number;
  replies: { id: number; content: string; nickname: string; replyToNickname: string; createTime: string }[];
};

function generateToc(content: string): TocItem[] {
  const lines = content.split("\n");
  const items: TocItem[] = [];
  let inCodeBlock = false;
  for (const line of lines) {
    if (line.trim().startsWith("```")) { inCodeBlock = !inCodeBlock; continue; }
    if (inCodeBlock) continue;
    const match = line.match(/^\s*(#{1,6})\s+(.+?)\s*$/);
    if (match) {
      const level = match[1]?.length ?? 1;
      const text = match[2]?.trim() ?? "";
      const id = text.toLowerCase().replace(/[^\w一-龥\s-]/g, "").replace(/\s+/g, "-");
      items.push({ id, text, level });
    }
  }
  return items;
}

export function ArticleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [detail, setDetail] = useState<ArticleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showToc, setShowToc] = useState(true);
  const [toc, setToc] = useState<TocItem[]>([]);
  const [interacting, setInteracting] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [replyTarget, setReplyTarget] = useState<{ id: number; nickname: string } | null>(null);
  const [replyContent, setReplyContent] = useState("");

  // Local state for optimistic updates
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [collected, setCollected] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [dislikeCount, setDislikeCount] = useState(0);
  const [collectionCount, setCollectionCount] = useState(0);

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    try {
      const d = await api.content.articleDetail(Number(id));
      setDetail(d);
      setToc(generateToc(d.content));
      setLiked(d.liked);
      setDisliked(d.disliked);
      setCollected(d.collected);
      setLikeCount(d.likeCount);
      setDislikeCount(d.dislikeCount);
      setCollectionCount(d.collectionCount);
    } catch {
      toast.error("加载文章失败");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchDetail(); }, [fetchDetail]);

  const fetchComments = useCallback(async () => {
    setCommentsLoading(true);
    try {
      const result = await api.content.comments(Number(id));
      setComments(result.records as Comment[]);
    } catch { /* silently fail */ } finally {
      setCommentsLoading(false);
    }
  }, [id]);

  useEffect(() => { if (commentsOpen) fetchComments(); }, [commentsOpen, fetchComments]);

  const handleInteract = async (type: number) => {
    if (!detail || interacting) return;
    setInteracting(true);
    // Optimistic update
    const prevLiked = liked;
    const prevDisliked = disliked;
    const prevCollected = collected;
    const prevLikeCount = likeCount;
    const prevDislikeCount = dislikeCount;
    const prevCollectionCount = collectionCount;

    if (type === 1) {
      if (liked) { setLiked(false); setLikeCount((c) => Math.max(0, c - 1)); }
      else {
        setLiked(true); setLikeCount((c) => c + 1);
        if (disliked) { setDisliked(false); setDislikeCount((c) => Math.max(0, c - 1)); }
      }
    } else if (type === 2) {
      if (disliked) { setDisliked(false); setDislikeCount((c) => Math.max(0, c - 1)); }
      else {
        setDisliked(true); setDislikeCount((c) => c + 1);
        if (liked) { setLiked(false); setLikeCount((c) => Math.max(0, c - 1)); }
      }
    } else if (type === 3) {
      if (collected) { setCollected(false); setCollectionCount((c) => Math.max(0, c - 1)); }
      else { setCollected(true); setCollectionCount((c) => c + 1); }
    }

    try {
      const msg = await api.content.interact(detail.id, type);
      toast.success(msg || "操作成功");
    } catch {
      // Rollback
      setLiked(prevLiked);
      setDisliked(prevDisliked);
      setCollected(prevCollected);
      setLikeCount(prevLikeCount);
      setDislikeCount(prevDislikeCount);
      setCollectionCount(prevCollectionCount);
      toast.error("操作失败");
    } finally {
      setInteracting(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => toast.success("链接已复制到剪贴板"));
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || interacting) return;
    setInteracting(true);
    try {
      await api.content.addComment(Number(id), newComment.trim());
      toast.success("评论成功");
      setNewComment("");
      fetchComments();
    } catch { toast.error("评论失败"); } finally { setInteracting(false); }
  };

  const handleReply = async (commentId: number) => {
    if (!replyContent.trim() || interacting) return;
    setInteracting(true);
    try {
      await api.content.addComment(Number(id), replyContent.trim(), commentId);
      toast.success("回复成功");
      setReplyTarget(null);
      setReplyContent("");
      fetchComments();
    } catch { toast.error("回复失败"); } finally { setInteracting(false); }
  };

  const handleLikeComment = async (commentId: number) => {
    try { await api.content.likeComment(commentId); fetchComments(); } catch { /* ignore */ }
  };

  const scrollToAnchor = (anchorId: string) => {
    const el = document.getElementById(anchorId);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Skeleton
  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8 md:py-12">
        <Skeleton className="mb-6 h-5 w-24" />
        <div className="flex gap-6">
          <div className="flex-1">
            <Skeleton className="mb-4 h-10 w-3/4" />
            <Skeleton className="mb-6 h-20 w-full" />
            <Skeleton className="mb-2 h-4 w-full" />
            <Skeleton className="mb-2 h-4 w-5/6" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </div>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center">
        <p className="text-lg text-cosmic-muted">文章不存在或已下架</p>
        <Link href="/library?tab=articles" className="mt-4 inline-block text-cosmic-sky hover:underline">
          返回内容馆
        </Link>
      </div>
    );
  }

  const authorInitial = detail.authorName?.[0] ?? "U";

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 md:py-12">
      {/* Back nav */}
      <Link href="/library?tab=articles" className="mb-6 inline-flex items-center gap-1 text-sm text-cosmic-muted hover:text-cosmic-sky transition-colors">
        <ArrowLeft className="size-4" /> 返回文章列表
      </Link>

      <div className="flex gap-6">
        {/* Left: TOC Sidebar */}
        <aside className={`hidden lg:block flex-shrink-0 transition-all duration-300 ${showToc ? "w-[260px]" : "w-[50px]"}`}>
          <div className="cosmic-card sticky top-24 p-4 max-h-[calc(100vh-140px)] overflow-y-auto">
            <button
              onClick={() => setShowToc(!showToc)}
              className="mb-3 flex items-center gap-2 text-sm font-semibold text-cosmic-muted hover:text-white transition-colors w-full text-left"
            >
              <Menu className="size-4" />
              {showToc && <span>目录</span>}
            </button>
            {showToc && (
              toc.length === 0 ? (
                <p className="text-xs text-cosmic-dim">无目录</p>
              ) : (
                <nav className="flex flex-col gap-1">
                  {toc.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => scrollToAnchor(item.id)}
                      className="text-left text-sm text-cosmic-muted hover:text-cosmic-sky hover:bg-white/5 rounded px-2 py-1 transition-colors truncate"
                      style={{ paddingLeft: `${8 + (item.level - 1) * 12}px`, fontSize: item.level === 1 ? "14px" : item.level === 2 ? "13px" : "12px", fontWeight: item.level === 1 ? 600 : 400 }}
                    >
                      {item.text}
                    </button>
                  ))}
                </nav>
              )
            )}
          </div>
        </aside>

        {/* Center: Main Content */}
        <div className="flex-1 min-w-0">
          <article className="cosmic-card p-6 md:p-8">
            <h1 className="mb-6 text-2xl font-bold text-white md:text-3xl">{detail.title}</h1>

            {/* Author info bar */}
            <div className="mb-8 flex items-center gap-4 rounded-lg bg-white/5 p-4 border border-white/10">
              <Avatar className="size-12 shrink-0">
                {detail.authorAvatar ? (
                  <img src={detail.authorAvatar} alt="" className="size-12 rounded-full object-cover" />
                ) : (
                  <AvatarFallback className="bg-cosmic-blue/20 text-cosmic-sky text-lg">{authorInitial}</AvatarFallback>
                )}
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white">{detail.authorName}</span>
                  {detail.authorRole === 4 && <Badge variant="gold" className="text-xs">官方</Badge>}
                  {detail.authorRole === 3 && detail.hospitalName && (
                    <Badge variant="secondary" className="text-xs">{detail.hospitalName}</Badge>
                  )}
                </div>
                <div className="mt-1 flex items-center gap-4 text-xs text-cosmic-dim">
                  <span>发布时间：{detail.createTime}</span>
                  {detail.type && <span className="cosmic-tag text-xs">{detail.type === "SCIENCE" ? "科普" : "案例"}</span>}
                  <span className="inline-flex items-center gap-1"><Eye className="size-3" /> {detail.viewCount}</span>
                </div>
              </div>
            </div>

            {/* Article content */}
            <div className="prose prose-invert max-w-none
              prose-headings:text-white prose-headings:font-semibold prose-headings:scroll-mt-24
              prose-h1:text-2xl prose-h1:mt-8 prose-h1:mb-4
              prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-4 prose-h2:border-b prose-h2:border-white/10 prose-h2:pb-2
              prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-3
              prose-p:text-cosmic-muted prose-p:leading-relaxed prose-p:my-3
              prose-a:text-cosmic-sky prose-a:no-underline prose-a:underline-offset-2 hover:prose-a:underline
              prose-strong:text-white prose-strong:font-semibold
              prose-code:text-cosmic-sky prose-code:bg-white/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-normal prose-code:before:content-none prose-code:after:content-none
              prose-pre:bg-black/30 prose-pre:border prose-pre:border-white/10 prose-pre:rounded-xl prose-pre:my-4
              prose-blockquote:border-l-cosmic-blue/60 prose-blockquote:bg-white/5 prose-blockquote:py-3 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-blockquote:not-italic prose-blockquote:text-cosmic-muted
              prose-li:text-cosmic-muted prose-li:my-1
              prose-img:rounded-xl prose-img:my-4
              prose-table:border-white/10 prose-th:bg-white/10 prose-th:text-white prose-th:font-semibold prose-th:px-4 prose-th:py-2 prose-td:text-cosmic-muted prose-td:px-4 prose-td:py-2
              prose-hr:border-white/10
              [&_*]:scroll-mt-24
            ">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ children, ...props }) => {
                    const text = String(children);
                    const id = text.toLowerCase().replace(/[^\w一-龥\s-]/g, "").replace(/\s+/g, "-");
                    return <h1 id={id} {...props}>{children}</h1>;
                  },
                  h2: ({ children, ...props }) => {
                    const text = String(children);
                    const id = text.toLowerCase().replace(/[^\w一-龥\s-]/g, "").replace(/\s+/g, "-");
                    return <h2 id={id} {...props}>{children}</h2>;
                  },
                  h3: ({ children, ...props }) => {
                    const text = String(children);
                    const id = text.toLowerCase().replace(/[^\w一-龥\s-]/g, "").replace(/\s+/g, "-");
                    return <h3 id={id} {...props}>{children}</h3>;
                  },
                  pre: ({ children }) => (
                    <div className="group relative my-4">
                      <div className="flex items-center justify-between rounded-t-xl bg-white/10 px-4 py-2 text-xs text-cosmic-dim">
                        <span className="inline-flex items-center gap-2">
                          <span className="size-2 rounded-full bg-red-400/60" />
                          <span className="size-2 rounded-full bg-yellow-400/60" />
                          <span className="size-2 rounded-full bg-green-400/60" />
                        </span>
                        <span>code</span>
                      </div>
                      <pre className="!mt-0 !rounded-t-none">{children}</pre>
                    </div>
                  ),
                  a: ({ href, children }) => (
                    <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5">
                      {children}
                    </a>
                  ),
                  img: ({ src, alt }) => (
                    <img src={src} alt={alt} className="rounded-xl my-4 max-w-full" loading="lazy" />
                  ),
                  table: ({ children }) => (
                    <div className="my-4 overflow-x-auto rounded-xl border border-white/10">
                      <table className="!my-0 w-full">{children}</table>
                    </div>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-cosmic-blue/60 bg-white/5 py-3 px-4 rounded-r-lg my-4">
                      {children}
                    </blockquote>
                  ),
                }}
              >
                {detail.content}
              </ReactMarkdown>
            </div>
          </article>

          {/* Bottom interaction bar */}
          <div className="cosmic-card sticky bottom-4 mt-6 flex items-center justify-around p-4 z-30">
            <button
              onClick={() => handleInteract(1)}
              disabled={interacting}
              className={`flex flex-col items-center gap-1 text-xs transition-colors ${liked ? "text-cosmic-sky" : "text-cosmic-dim hover:text-cosmic-sky"}`}
            >
              <ThumbsUp className={`size-5 ${liked ? "fill-current" : ""}`} />
              <span>{likeCount} 点赞</span>
            </button>
            <button
              onClick={() => handleInteract(2)}
              disabled={interacting}
              className={`flex flex-col items-center gap-1 text-xs transition-colors ${disliked ? "text-red-400" : "text-cosmic-dim hover:text-red-400"}`}
            >
              <ThumbsDown className={`size-5 ${disliked ? "fill-current" : ""}`} />
              <span>{dislikeCount} 踩</span>
            </button>
            <button
              onClick={() => handleInteract(3)}
              disabled={interacting}
              className={`flex flex-col items-center gap-1 text-xs transition-colors ${collected ? "text-cosmic-gold" : "text-cosmic-dim hover:text-cosmic-gold"}`}
            >
              <Star className={`size-5 ${collected ? "fill-current" : ""}`} />
              <span>{collectionCount} 收藏</span>
            </button>
            <button
              onClick={() => setCommentsOpen(true)}
              className="flex flex-col items-center gap-1 text-xs text-cosmic-dim hover:text-cosmic-sky transition-colors"
            >
              <MessageCircle className="size-5" />
              <span>{detail.commentCount ?? 0} 评论</span>
            </button>
            <button
              onClick={handleCopyLink}
              className="flex flex-col items-center gap-1 text-xs text-cosmic-dim hover:text-cosmic-sky transition-colors"
            >
              <Share2 className="size-5" />
              <span>分享</span>
            </button>
          </div>
        </div>

        {/* Right: Recommendations Sidebar */}
        <aside className="hidden xl:block w-[280px] flex-shrink-0">
          <div className="sticky top-24 space-y-4">
            {detail.recommendations.length > 0 && (
              <div className="cosmic-card p-4">
                <h3 className="mb-3 text-sm font-semibold text-white border-l-2 border-cosmic-blue pl-2">推荐文章</h3>
                {detail.recommendations.map((rec) => (
                  <Link
                    key={rec.id}
                    href={`/library/article/${rec.id}`}
                    className="block py-2 text-sm text-cosmic-muted hover:text-cosmic-sky transition-colors truncate"
                  >
                    {rec.title}
                  </Link>
                ))}
              </div>
            )}
            {detail.recommendations.length === 0 && (
              <div className="cosmic-card p-4 text-center text-xs text-cosmic-dim">暂无推荐</div>
            )}
          </div>
        </aside>
      </div>

      {/* Comments Dialog */}
      <Dialog open={commentsOpen} onOpenChange={setCommentsOpen}>
        <DialogContent className="!max-w-[450px]">
          <DialogTitle className="flex items-center justify-between">
            <span>全部评论</span>
            <DialogClose asChild>
              <Button variant="ghost" size="icon-sm"><X className="size-4" /></Button>
            </DialogClose>
          </DialogTitle>

          {/* Comment input */}
          <div className="mb-6">
            <div className="flex gap-3 items-start">
              <Avatar className="size-8 shrink-0">
                <AvatarFallback className="bg-cosmic-blue/20 text-cosmic-sky"><User className="size-4" /></AvatarFallback>
              </Avatar>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="欢迎发表评论..."
                maxLength={1000}
                rows={3}
                className="cosmic-input flex-1 rounded-lg px-3 py-2 text-sm resize-none"
              />
            </div>
            <div className="mt-2 flex justify-end">
              <Button variant="primary" size="xs" onClick={handleAddComment} disabled={interacting || !newComment.trim()}>评论</Button>
            </div>
          </div>

          {/* Comments list */}
          {commentsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : (
            <div className="space-y-4 max-h-[50vh] overflow-y-auto">
              {comments.map((comment) => (
                <div key={comment.id} className="border-b border-white/10 pb-3">
                  <div className="flex items-start gap-3">
                    <Avatar className="size-8 shrink-0">
                      {comment.headPath ? <img src={comment.headPath} alt="" className="size-8 rounded-full object-cover" /> : <AvatarFallback className="bg-cosmic-blue/20 text-cosmic-sky">{comment.nickname[0]}</AvatarFallback>}
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm text-white">{comment.nickname}</span>
                        <span className="text-xs text-cosmic-dim">{comment.createTime}</span>
                      </div>
                      <p className="mt-1 text-sm text-cosmic-muted">{comment.content}</p>
                      <div className="mt-1 flex items-center gap-3 text-xs">
                        <button onClick={() => handleLikeComment(comment.id)} className={`${comment.liked ? "text-cosmic-sky" : "text-cosmic-dim"} hover:text-cosmic-sky transition-colors`}>
                          <ThumbsUp className="size-3 inline mr-1" />{comment.likeCount}
                        </button>
                        <button onClick={() => setReplyTarget({ id: comment.id, nickname: comment.nickname })} className="text-cosmic-dim hover:text-cosmic-sky transition-colors">回复</button>
                      </div>

                      {/* Replies */}
                      {comment.replies.length > 0 && (
                        <div className="mt-2 ml-2 space-y-2 border-l-2 border-white/10 pl-3">
                          {comment.replies.map((reply) => (
                            <div key={reply.id} className="text-sm">
                              <span className="font-medium text-white">{reply.nickname}</span>
                              {reply.replyToNickname && <span className="text-cosmic-dim"> 回复 @{reply.replyToNickname}</span>}
                              <span className="ml-2 text-xs text-cosmic-dim">{reply.createTime}</span>
                              <p className="text-cosmic-muted">{reply.content}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Reply input */}
                      {replyTarget?.id === comment.id && (
                        <div className="mt-2 flex gap-2">
                          <input
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            placeholder={`回复 @${replyTarget.nickname}`}
                            className="cosmic-input flex-1 rounded-lg px-3 py-1.5 text-sm"
                          />
                          <Button variant="primary" size="xs" onClick={() => handleReply(comment.id)}>确定</Button>
                          <Button variant="ghost" size="xs" onClick={() => setReplyTarget(null)}>取消</Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {comments.length === 0 && <p className="text-center text-cosmic-dim text-sm py-8">暂无评论</p>}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
