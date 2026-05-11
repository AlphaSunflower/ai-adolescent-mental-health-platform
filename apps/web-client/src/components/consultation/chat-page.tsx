"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Send, Image, User, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { api, httpClient } from "@/lib/api";
import { getToken } from "@/lib/session";

interface ChatMessage {
  id: number;
  content: string;
  contentType: number; // 0=text, 1=image, 2=system
  senderId: number;
  senderName: string;
  senderAvatar?: string;
  createTime: string;
}

interface AppointmentDetail {
  id: number;
  psychologistName?: string;
  psychologistId?: number;
  psychologistAvatar?: string;
  status?: number;
}

export function ConsultationChatPage() {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const router = useRouter();
  const [detail, setDetail] = useState<AppointmentDetail | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const reconnectRef = useRef(0);
  const maxReconnect = 3;

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, 100);
  }, []);

  // Load appointment detail and message history
  useEffect(() => {
    const id = Number(appointmentId);
    if (!id) return;
    (async () => {
      try {
        const d = (await api.appointment.detail(id)) as unknown as AppointmentDetail;
        setDetail(d);
      } catch {
        setDetail(null);
      }
      try {
        const msgs = (await api.chat.history(id)) as unknown as ChatMessage[];
        setMessages(msgs.reverse());
      } catch { /* ignore */ }
      setLoading(false);
      scrollToBottom();
    })();
  }, [appointmentId, scrollToBottom]);

  // SSE connection
  useEffect(() => {
    const id = Number(appointmentId);
    if (!id) return;
    const token = getToken();
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api";
    const url = `${baseUrl.replace(/\/$/, "")}/psychologist/message/stream/${id}?token=${token || ""}`;

    let eventSource: EventSource | null = null;
    let shouldReconnect = true;

    const connect = () => {
      eventSource = new EventSource(url);
      eventSource.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data) as ChatMessage;
          if (msg.contentType === 2) {
            setMessages((prev) => [...prev, { ...msg, content: `[系统消息] ${msg.content}` }]);
          } else {
            setMessages((prev) => {
              if (prev.some((m) => m.id === msg.id)) return prev;
              return [...prev, msg];
            });
          }
          scrollToBottom();
        } catch { /* ignore */ }
      };
      eventSource.onerror = () => {
        eventSource?.close();
        if (shouldReconnect && reconnectRef.current < maxReconnect) {
          reconnectRef.current++;
          setTimeout(connect, 3000);
        }
      };
    };

    connect();
    return () => {
      shouldReconnect = false;
      eventSource?.close();
    };
  }, [appointmentId, scrollToBottom]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;
    const id = Number(appointmentId);
    if (!id || !detail?.psychologistId) return;
    setSending(true);
    try {
      await api.chat.send(id, detail.psychologistId, text);
      setInput("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "发送失败");
    }
    setSending(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("图片不能超过 5MB"); return; }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const token = getToken();
      const res = await httpClient.raw.post("/common/upload", formData, {
        headers: { "Content-Type": "multipart/form-data", ...(token ? { Authorization: `Bearer ${token}`, token } : {}) },
      });
      const data = res.data as { code: number; data: string; message?: string };
      if (data.code === 200 && data.data) {
        const id = Number(appointmentId);
        if (id && detail?.psychologistId) {
          await api.chat.sendImage(id, detail.psychologistId, data.data);
        }
      } else {
        toast.error("图片上传失败");
      }
    } catch {
      toast.error("图片上传失败");
    }
    setUploading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (loading) {
    return (
      <div className="mx-auto flex h-full max-w-3xl flex-col px-4">
        <Skeleton className="mb-4 h-5 w-24" />
        <Skeleton className="mb-4 h-16 w-full rounded-xl" />
        <div className="flex-1 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className={`h-12 w-3/4 rounded-xl ${i % 2 === 0 ? "ml-auto" : ""}`} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-4rem)] max-w-3xl flex-col px-4">
      {/* Header */}
      <div className="flex items-center gap-4 py-3 border-b border-white/10 shrink-0">
        <Link href="/me/orders" className="text-cosmic-muted hover:text-cosmic-sky transition-colors">
          <ArrowLeft className="size-5" />
        </Link>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Avatar className="size-9 shrink-0">
            {detail?.psychologistAvatar ? (
              <img src={detail.psychologistAvatar} alt="" className="size-9 rounded-full object-cover" />
            ) : (
              <AvatarFallback className="bg-cosmic-blue/20 text-cosmic-sky"><User className="size-4" /></AvatarFallback>
            )}
          </Avatar>
          <span className="font-medium text-cosmic-header text-sm truncate">
            {detail?.psychologistName || "心理咨询师"}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto py-4 space-y-3">
        {messages.length === 0 && (
          <div className="py-12 text-center text-cosmic-dim text-sm">
            暂无消息，发送第一条消息开始沟通
          </div>
        )}
        {messages.map((msg) => {
          const isSystem = msg.contentType === 2;
          if (isSystem) {
            return (
              <div key={msg.id} className="flex justify-center">
                <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-cosmic-dim">{msg.content}</span>
              </div>
            );
          }
          const isMine = msg.senderId !== detail?.psychologistId;
          return (
            <div key={msg.id} className={`flex gap-2 ${isMine ? "flex-row-reverse" : ""}`}>
              <Avatar className="size-7 shrink-0 mt-0.5">
                {msg.senderAvatar ? (
                  <img src={msg.senderAvatar} alt="" className="size-7 rounded-full object-cover" />
                ) : (
                  <AvatarFallback className="bg-cosmic-blue/20 text-cosmic-sky text-xs"><User className="size-3" /></AvatarFallback>
                )}
              </Avatar>
              <div className={`max-w-[70%] rounded-xl px-3 py-2 text-sm ${
                isMine ? "bg-cosmic-blue/30 text-white" : "bg-white/10 text-cosmic-header"
              }`}>
                {msg.contentType === 1 ? (
                  <img src={msg.content} alt="" className="max-w-full rounded-lg" />
                ) : (
                  <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Input */}
      <div className="flex items-end gap-2 py-3 border-t border-white/10 shrink-0">
        <label className="flex cursor-pointer items-center justify-center size-9 rounded-lg text-cosmic-muted hover:text-cosmic-sky hover:bg-white/5 transition-colors">
          {uploading ? <Loader2 className="size-5 animate-spin" /> : <Image className="size-5" />}
          <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} className="hidden" />
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="输入消息..."
          rows={1}
          className="cosmic-input flex-1 resize-none rounded-lg px-3 py-2 text-sm min-h-0"
        />
        <Button
          variant="primary"
          size="icon-sm"
          onClick={handleSend}
          disabled={!input.trim() || sending}
        >
          <Send className="size-4" />
        </Button>
      </div>
    </div>
  );
}
