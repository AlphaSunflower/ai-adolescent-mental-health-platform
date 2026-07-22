"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User, ThumbsUp, ThumbsDown, Heart, Share2, Eye, Clock } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import type { ArticleDetail } from "@/lib/types";

export function UserArticleDetailPage() {
  const { userId, articleId } = useParams<{ userId: string; articleId: string }>();
  const router = useRouter();
  const [article, setArticle] = useState<ArticleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const detail = await api.content.userArticleDetail(Number(articleId));
        setArticle(detail);
      } catch {
        setNotFound(true);
      }
      setLoading(false);
    })();
  }, [articleId]);

  const handleInteract = async (type: number) => {
    if (!article) return;
    const id = Number(articleId);
    const prev = { ...article };
    try {
      if (type === 0) setArticle({ ...article, liked: !article.liked, likeCount: article.likeCount + (article.liked ? -1 : 1) });
      if (type === 1) setArticle({ ...article, disliked: !article.disliked });
      if (type === 2) setArticle({ ...article, collected: !article.collected, collectionCount: article.collectionCount + (article.collected ? -1 : 1) });
      await api.content.interact(id, type);
    } catch (err) {
      setArticle(prev);
      toast.error(err instanceof Error ? err.message : "操作失败");
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 md:py-12">
        <Skeleton className="mb-4 h-5 w-24" />
        <Skeleton className="mb-2 h-8 w-3/4" />
        <Skeleton className="mb-6 h-4 w-48" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  if (notFound || !article) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center">
        <p className="text-lg text-cosmic-muted">文章不存在或已删除</p>
        <Link href="/library?tab=community" className="mt-4 inline-block text-cosmic-sky hover:underline">
          返回心声广场
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:py-12">
      <Link
        href="/library?tab=community"
        className="mb-6 inline-flex items-center gap-1 text-sm text-cosmic-muted hover:text-cosmic-sky transition-colors"
      >
        <ArrowLeft className="size-4" /> 返回心声广场
      </Link>

      {/* Article header */}
      <h1 className="mb-4 text-2xl font-bold text-white md:text-3xl">{article.title}</h1>

      {/* Author info */}
      <div className="mb-6 flex items-center gap-3">
        <Link href={`/user/${userId}`} className="shrink-0">
          <div className="size-10 rounded-full bg-cosmic-blue/20 flex items-center justify-center hover:ring-2 hover:ring-cosmic-sky/50 transition-all">
            {article.authorAvatar ? (
              <img src={article.authorAvatar} alt="" className="size-10 rounded-full object-cover" />
            ) : (
              <User className="size-5 text-cosmic-sky" />
            )}
          </div>
        </Link>
        <div>
          <Link href={`/user/${userId}`} className="text-sm font-medium text-cosmic-header hover:text-cosmic-sky transition-colors">
            {article.authorName}
          </Link>
          <div className="flex items-center gap-3 text-xs text-cosmic-dim mt-0.5">
            <span className="flex items-center gap-1"><Clock className="size-3" />{article.createTime}</span>
            <span className="flex items-center gap-1"><Eye className="size-3" />{article.viewCount}</span>
          </div>
        </div>
      </div>

      {/* Article content */}
      <div className="cosmic-card mb-6 p-6 md:p-8">
        {article.content ? (
          <div className="prose prose-invert max-w-none
            prose-headings:text-white prose-headings:font-semibold
            prose-h1:text-2xl prose-h1:mt-8 prose-h1:mb-4
            prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-4 prose-h2:border-b prose-h2:border-white/10 prose-h2:pb-2
            prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-3
            prose-p:text-cosmic-muted prose-p:leading-relaxed prose-p:my-3
            prose-a:text-cosmic-sky prose-a:no-underline hover:prose-a:underline
            prose-strong:text-white prose-strong:font-semibold
            prose-code:text-cosmic-sky prose-code:bg-white/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:before:content-none prose-code:after:content-none
            prose-pre:bg-black/30 prose-pre:border prose-pre:border-white/10 prose-pre:rounded-xl
            prose-blockquote:border-l-cosmic-blue/60 prose-blockquote:bg-white/5 prose-blockquote:py-3 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-blockquote:not-italic prose-blockquote:text-cosmic-muted
            prose-li:text-cosmic-muted prose-li:my-1
            prose-img:rounded-xl prose-img:my-4
            prose-hr:border-white/10
          ">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{article.content}</ReactMarkdown>
          </div>
        ) : (
          <p className="text-cosmic-muted text-sm">暂无正文内容</p>
        )}
      </div>

      {/* Interaction bar */}
      <div className="cosmic-card flex items-center justify-center gap-4 p-4">
        <button
          onClick={() => handleInteract(0)}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm transition-colors ${
            article.liked ? "text-cosmic-sky bg-cosmic-blue/20" : "text-cosmic-dim hover:text-cosmic-sky hover:bg-white/5"
          }`}
        >
          <ThumbsUp className="size-4" />
          <span>{article.likeCount || 0}</span>
        </button>
        <button
          onClick={() => handleInteract(1)}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm transition-colors ${
            article.disliked ? "text-red-400 bg-red-400/10" : "text-cosmic-dim hover:text-red-400 hover:bg-white/5"
          }`}
        >
          <ThumbsDown className="size-4" />
        </button>
        <button
          onClick={() => handleInteract(2)}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm transition-colors ${
            article.collected ? "text-cosmic-gold bg-cosmic-gold/10" : "text-cosmic-dim hover:text-cosmic-gold hover:bg-white/5"
          }`}
        >
          <Heart className={`size-4 ${article.collected ? "fill-current" : ""}`} />
          <span>{article.collectionCount || 0}</span>
        </button>
        <button
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            toast.success("链接已复制");
          }}
          className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-cosmic-dim hover:text-cosmic-sky hover:bg-white/5 transition-colors"
        >
          <Share2 className="size-4" />
        </button>
      </div>
    </div>
  );
}
