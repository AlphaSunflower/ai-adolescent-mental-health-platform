"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { api } from "@/lib/api";

const PRIVACY_ITEMS = [
  { key: "allowViewArticles", label: "允许他人查看我的文章" },
  { key: "allowViewLikes", label: "允许他人查看我的点赞" },
  { key: "allowViewCollections", label: "允许他人查看我的收藏" },
  { key: "allowViewFollowings", label: "允许他人查看我的关注列表" },
  { key: "allowViewFans", label: "允许他人查看我的粉丝列表" },
];

export function PrivacyPage() {
  const [form, setForm] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.user.getPrivacy()
      .then((d) => {
        const f: Record<string, number> = {};
        for (const item of PRIVACY_ITEMS) {
          f[item.key] = d[item.key] ? 1 : 0;
        }
        setForm(f);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.user.updatePrivacy(form);
      toast.success("保存成功");
    } catch (err: unknown) {
      toast.error((err as Error)?.message ?? "保存失败");
    } finally {
      setSaving(false);
    }
  };

  const toggle = (key: string) => {
    setForm((prev) => ({ ...prev, [key]: prev[key] ? 0 : 1 }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full max-w-[500px] rounded-xl" />)}
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold text-white">隐私设置</h1>
      <div className="cosmic-card max-w-[540px] p-6 space-y-5">
        {PRIVACY_ITEMS.map((item) => (
          <div key={item.key} className="flex items-center justify-between">
            <span className="text-sm text-cosmic-muted">{item.label}</span>
            <button
              onClick={() => toggle(item.key)}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                form[item.key] ? "bg-cosmic-blue" : "bg-white/20"
              }`}
            >
              <span
                className={`absolute top-0.5 size-5 rounded-full bg-white transition-all ${
                  form[item.key] ? "right-0.5" : "left-0.5"
                }`}
              />
            </button>
          </div>
        ))}
        <div className="pt-2">
          <Button variant="primary" size="sm" onClick={handleSave} disabled={saving}>
            {saving ? "保存中..." : "保存设置"}
          </Button>
        </div>
      </div>
      <div className="mt-6 max-w-[540px] rounded-lg bg-cosmic-blue/5 border border-cosmic-blue/20 p-4 text-sm text-cosmic-dim">
        温馨提示：设置"允许他人查看"后，其他用户可以在您的个人主页中查看对应的内容。关闭后，其他用户将无法查看这些信息。
      </div>
    </div>
  );
}
