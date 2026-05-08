"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { getToken } from "@/lib/session";

type Tag = { id: number; name: string; code: string };

export function PublishPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tagId, setTagId] = useState<number | undefined>();
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Cover
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const router = useRouter();

  useEffect(() => {
    api.content.articleTags()
      .then((data) => setTags(data as Tag[]))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "image/jpeg" && file.type !== "image/png") {
      toast.error("封面图片必须是 JPG 或 PNG 格式");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      toast.error("封面图片大小不能超过 3MB");
      return;
    }
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const uploadCover = async (): Promise<string> => {
    const formData = new FormData();
    formData.append("file", coverFile as File);
    const token = getToken();
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080"}/article/user/cover/upload`, {
      method: "POST",
      body: formData,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const data = await res.json() as { code: number; data: string; message?: string };
    if (data.code !== 200) throw new Error(data.message ?? "封面上传失败");
    return data.data;
  };

  const handleSubmit = async () => {
    if (!title.trim()) { toast.error("请输入文章标题"); return; }
    if (!content.trim()) { toast.error("请输入文章内容"); return; }
    if (!tagId) { toast.error("请选择文章标签"); return; }

    setSubmitting(true);
    try {
      let coverUrl = "";
      if (coverFile) {
        coverUrl = await uploadCover();
      }
      await api.content.publishArticle({
        title: title.trim(),
        content: content.trim(),
        tagId,
        coverUrl: coverUrl || undefined,
      });
      toast.success("提交成功，等待审核");
      router.push("/me/articles");
    } catch (err: unknown) {
      toast.error((err as Error)?.message ?? "提交失败");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-40 w-full rounded-lg" />
        <Skeleton className="h-[400px] w-full rounded-lg" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold text-white">发布文章</h1>

      <div className="cosmic-card max-w-[800px] p-6 space-y-5">
        {/* Title */}
        <div>
          <label className="mb-1 block text-sm text-cosmic-dim">文章标题 <span className="text-red-400">*</span></label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
            placeholder="请输入文章标题"
            className="cosmic-input w-full rounded-lg px-3 py-2 text-sm"
          />
          <span className="mt-0.5 text-xs text-cosmic-dim">{title.length}/100</span>
        </div>

        {/* Cover */}
        <div>
          <label className="mb-1 block text-sm text-cosmic-dim">封面图片</label>
          <div
            onClick={() => fileInputRef.current?.click()}
            className="size-[180px] rounded-lg border-2 border-dashed border-white/20 flex items-center justify-center cursor-pointer hover:border-cosmic-sky/50 transition-colors overflow-hidden"
          >
            {coverPreview ? (
              <img src={coverPreview} alt="cover" className="size-full object-cover" />
            ) : (
              <div className="text-center text-cosmic-dim">
                <Upload className="size-6 mx-auto mb-1" />
                <span className="text-xs">点击上传封面</span>
              </div>
            )}
          </div>
          {coverPreview && (
            <button
              onClick={(e) => { e.stopPropagation(); setCoverFile(null); setCoverPreview(""); }}
              className="mt-1 text-xs text-red-400 hover:text-red-300"
            >
              移除封面
            </button>
          )}
          <p className="mt-1 text-xs text-cosmic-dim">支持 JPG/PNG，建议尺寸 800x450，不超过 3MB</p>
          <input ref={fileInputRef} type="file" accept="image/jpeg,image/png" onChange={handleCoverChange} className="hidden" />
        </div>

        {/* Tag */}
        <div>
          <label className="mb-1 block text-sm text-cosmic-dim">文章标签 <span className="text-red-400">*</span></label>
          <select
            value={tagId ?? ""}
            onChange={(e) => setTagId(e.target.value ? Number(e.target.value) : undefined)}
            className="cosmic-input w-full max-w-[200px] rounded-lg px-3 py-2 text-sm"
          >
            <option value="">请选择标签</option>
            {tags.map((tag) => <option key={tag.id} value={tag.id}>{tag.name}</option>)}
          </select>
        </div>

        {/* Content */}
        <div>
          <label className="mb-1 block text-sm text-cosmic-dim">文章内容 <span className="text-red-400">*</span></label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={16}
            placeholder="请输入文章内容（支持 Markdown 格式）..."
            className="cosmic-input w-full rounded-lg px-3 py-3 text-sm resize-none font-mono"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button variant="primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? "提交中..." : "提交审核"}
          </Button>
          <Button variant="ghost" onClick={() => router.push("/me/articles")}>取消</Button>
        </div>
      </div>
    </div>
  );
}
