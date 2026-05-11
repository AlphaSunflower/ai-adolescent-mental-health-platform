"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { isLoggedIn } from "@/lib/session";
import { api } from "@/lib/api";

type FeedbackDialogContextValue = {
  open: () => void;
};

const FeedbackDialogContext = createContext<FeedbackDialogContextValue>({
  open: () => {},
});

export function useFeedbackDialog() {
  return useContext(FeedbackDialogContext);
}

export function FeedbackDialogProvider({ children }: { children: React.ReactNode }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const open = useCallback(() => {
    if (!isLoggedIn()) {
      toast.error("请先登录后再提交反馈");
      return;
    }
    setContent("");
    setDialogOpen(true);
  }, []);

  const handleSubmit = async () => {
    const trimmed = content.trim();
    if (!trimmed) {
      toast.error("请输入反馈内容");
      return;
    }
    setSubmitting(true);
    try {
      await api.feedback.submitPlatform({ content: trimmed });
      toast.success("感谢您的反馈！");
      setDialogOpen(false);
    } catch {
      toast.error("提交失败，请稍后重试");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FeedbackDialogContext.Provider value={{ open }}>
      {children}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>意见反馈</DialogTitle>
            <DialogDescription>
              请描述您遇到的问题或建议，我们会认真对待每一条反馈。
            </DialogDescription>
          </DialogHeader>
          <div className="px-6 py-4">
            <textarea
              className="cosmic-input w-full min-h-[160px] resize-none rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-cosmic-dim focus:border-cosmic-gold/60 focus:outline-none"
              placeholder="请输入您的反馈内容..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={2000}
            />
            <p className="mt-2 text-right text-xs text-cosmic-dim">{content.length}/2000</p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDialogOpen(false)}
            >
              取消
            </Button>
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? "提交中..." : "提交反馈"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </FeedbackDialogContext.Provider>
  );
}
