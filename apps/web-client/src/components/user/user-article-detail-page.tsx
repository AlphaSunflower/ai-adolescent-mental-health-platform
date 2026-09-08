"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User, ThumbsUp, ThumbsDown, Heart, Share2, Eye, Clock } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
import { Button } from "@/components/pouf/Button";
import { Skeleton } from "@/components/pouf/Skeleton";
import { Card } from "@/components/pouf/Card";
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
        <p className="text-lg text-muted">文章不存在或已删除</p>
        <Link href="/library?tab=community" className="mt-4 inline-block text-blue hover:underline">
          返回心声广场
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:py-12">
      <Link
        href="/library?tab=community"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted hover:text-blue transition-colors"
      >
        <ArrowLeft className="size-4" /> 返回心声广场
      </Link>

      {/* Article header */}
      <h1 className="mb-4 text-2xl font-black text-ink md:text-3xl">{article.title}</h1>

      {/* Author info */}
      <div className="mb-6 flex items-center gap-3">
        <Link href={`/user/${userId}`} className="shrink-0">
          <div className="size-10 rounded-full bg-purple/20 flex items-center justify-center hover:ring-2 hover:ring-blue/50 transition-all">
            {article.authorAvatar ? (
              <img src={article.authorAvatar} alt="" className="size-10 rounded-full object-cover" />
            ) : (
              <User className="size-5 text-blue" />
            )}
          </div>
        </Link>
        <div>
          <Link href={`/user/${userId}`} className="text-sm font-bold text-ink hover:text-blue transition-colors">
            {article.authorName}
          </Link>
          <div className="flex items-center gap-3 text-xs text-muted/70 mt-0.5">
            <span className="flex items-center gap-1"><Clock className="size-3" />{article.createTime}</span>
            <span className="flex items-center gap-1"><Eye className="size-3" />{article.viewCount}</span>
          </div>
        </div>
      </div>

      {/* Article content */}
      <Card className="mb-6 p-6 md:p-8">
        {article.content ? (
          <div className="prose prose-sm max-w-none
            prose-headings:text-ink prose-headings:font-bold
            prose-h1:text-2xl prose-h1:mt-8 prose-h1:mb-4
            prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-4 prose-h2:border-b prose-h2:border-[rgba(201,168,255,0.3)] prose-h2:pb-2
            prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-3
            prose-p:text-ink/80 prose-p:leading-relaxed prose-p:my-3
            prose-a:text-blue prose-a:no-underline hover:prose-a:underline
            prose-strong:text-ink prose-strong:font-bold
            prose-code:text-ink prose-code:bg-purple/20 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-xs prose-code:before:content-none prose-code:after:content-none
            prose-pre:bg-bg prose-pre:border prose-pre:border-[rgba(201,168,255,0.3)] prose-pre:rounded-xl prose-pre:text-ink
            prose-blockquote:border-l-blue/60 prose-blockquote:bg-bg prose-blockquote:py-3 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-blockquote:not-italic prose-blockquote:text-ink/80
            prose-li:text-ink/80 prose-li:my-1
            prose-img:rounded-xl prose-img:my-4
            prose-hr:border-[rgba(201,168,255,0.3)]
          ">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{article.content}</ReactMarkdown>
          </div>
        ) : (
          <p className="text-muted text-sm">暂无正文内容</p>
        )}
      </Card>

      {/* Interaction bar */}
      <Card className="flex items-center justify-center gap-4 p-4">
        <button
          onClick={() => handleInteract(0)}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm transition-colors ${
            article.liked ? "text-blue bg-purple/20" : "text-muted/70 hover:text-blue hover:bg-purple/10"
          }`}
        >
          <ThumbsUp className="size-4" />
          <span>{article.likeCount || 0}</span>
        </button>
        <button
          onClick={() => handleInteract(1)}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm transition-colors ${
            article.disliked ? "text-pink bg-pink/10" : "text-muted/70 hover:text-pink hover:bg-purple/10"
          }`}
        >
          <ThumbsDown className="size-4" />
        </button>
        <button
          onClick={() => handleInteract(2)}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm transition-colors ${
            article.collected ? "text-yellow bg-yellow/10" : "text-muted/70 hover:text-yellow hover:bg-purple/10"
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
          className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-muted/70 hover:text-blue hover:bg-purple/10 transition-colors"
        >
          <Share2 className="size-4" />
        </button>
      </Card>
    </div>
  );
}
