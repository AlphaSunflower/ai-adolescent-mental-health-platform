"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Bot, Send, Plus, Menu, X, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { getToken, clearSession } from "@/lib/session";
import { streamAiChat } from "@ai-adolescent-mental-health/api-client";
import type { AiSession, AiMessage } from "@/lib/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

function sessionOptions() {
  return {
    baseURL: BASE_URL,
    getToken,
    onUnauthorized: () => {
      clearSession();
      window.location.href = "/login";
    },
  };
}

export function AiChatPage() {
  const [sessions, setSessions] = useState<AiSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<number | null>(null);
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatTopRef = useRef<HTMLDivElement>(null);
  const isInitialLoadRef = useRef(true);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // On session switch, reset scroll position to top
  useEffect(() => {
    isInitialLoadRef.current = true;
    chatTopRef.current?.scrollIntoView();
  }, [activeSessionId]);

  // Scroll to bottom when user sends a message or during streaming
  useEffect(() => {
    if (isInitialLoadRef.current && messages.length > 0 && !sending) {
      // Initial messages loaded — scroll to top to show conversation start
      isInitialLoadRef.current = false;
      chatTopRef.current?.scrollIntoView();
      return;
    }
    if (sending || messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, sending, scrollToBottom]);

  useEffect(() => {
    api.ai.sessions()
      .then((s) => {
        setSessions(s);
        if (s.length > 0) setActiveSessionId(s[0].id);
      })
      .catch(() => toast.error("加载会话失败"))
      .finally(() => setLoadingSessions(false));
  }, []);

  useEffect(() => {
    if (activeSessionId === null) return;
    setLoadingMessages(true);
    api.ai.messages(activeSessionId)
      .then(setMessages)
      .catch(() => { setMessages([]); })
      .finally(() => setLoadingMessages(false));
  }, [activeSessionId]);

  const handleCreateSession = async () => {
    try {
      const session = await api.ai.createSession();
      setSessions((prev) => [session, ...prev]);
      setActiveSessionId(session.id);
      setMessages([]);
      setSidebarOpen(false);
    } catch {
      toast.error("创建会话失败");
    }
  };

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || activeSessionId === null || sending) return;

    const userMessage: AiMessage = {
      id: Date.now(),
      role: "user",
      content: trimmed,
      createTime: new Date().toISOString(),
    };

    const assistantMessage: AiMessage = {
      id: Date.now() + 1,
      role: "assistant",
      content: "",
      createTime: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setInput("");
    setSending(true);

    try {
      let fullContent = "";
      await streamAiChat(
        sessionOptions(),
        activeSessionId,
        trimmed,
        (chunk) => {
          fullContent += chunk;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMessage.id ? { ...m, content: fullContent } : m
            )
          );
        },
      );
    } catch {
      toast.error("对话请求失败，请重试");
      setMessages((prev) => prev.filter((m) => m.id !== assistantMessage.id));
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="relative flex h-[calc(100vh-4rem)] -mt-2">
      {/* Mobile sidebar toggle */}
      <button
        type="button"
        className="fixed left-4 top-20 z-30 rounded-lg bg-cosmic-card-bg p-3 backdrop-blur-md lg:hidden border border-white/10"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X className="size-5 text-cosmic-muted" /> : <Menu className="size-5 text-cosmic-muted" />}
      </button>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Session Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-20 w-64 transform border-r border-white/10 bg-cosmic-card-bg backdrop-blur-xl transition-transform lg:relative lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-white/10 p-4">
            <h2 className="font-semibold text-white">会话列表</h2>
            <Button variant="outline" size="icon-sm" onClick={handleCreateSession} title="新建会话">
              <Plus className="size-4" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {loadingSessions ? (
              <div className="space-y-2 p-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : sessions.length === 0 ? (
              <div className="p-4 text-center text-sm text-cosmic-dim">
                暂无会话，点击 + 创建
              </div>
            ) : (
              sessions.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => { setActiveSessionId(s.id); setSidebarOpen(false); }}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    activeSessionId === s.id
                      ? "bg-cosmic-blue/20 text-white"
                      : "text-cosmic-muted hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <div className="truncate">{s.title}</div>
                  <div className="text-xs text-cosmic-dim">{s.createTime}</div>
                </button>
              ))
            )}
          </div>
        </div>
      </aside>

      {/* Chat Area */}
      <main className="flex flex-1 flex-col">
        {activeSessionId === null ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <Bot className="mx-auto mb-4 size-16 text-cosmic-blue opacity-40" />
              <p className="text-lg text-cosmic-muted">选择一个会话或创建新会话</p>
              <Button variant="primary" className="mt-4" onClick={handleCreateSession}>
                <Plus className="mr-1 size-4" />
                新建会话
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-4 py-6">
              {loadingMessages ? (
                <div className="mx-auto max-w-3xl space-y-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}>
                      <Skeleton className={`h-16 ${i % 2 === 0 ? "w-2/3" : "w-3/4"} rounded-2xl`} />
                    </div>
                  ))}
                </div>
              ) : messages.length === 0 ? (
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <Bot className="mx-auto mb-4 size-12 text-cosmic-blue opacity-30" />
                    <p className="text-cosmic-muted">开始和 AI 咨询师对话吧</p>
                  </div>
                </div>
              ) : (
                <div className="mx-auto max-w-3xl space-y-4">
                  <div ref={chatTopRef} />
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                          msg.role === "user"
                            ? "cosmic-btn-primary"
                            : "cosmic-card border border-white/10"
                        }`}
                      >
                        {msg.content ? (
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-cosmic-dim">
                            <span className="size-1.5 animate-pulse rounded-full bg-cosmic-gold" />
                            正在思考...
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="border-t border-white/10 bg-cosmic-card-bg/50 p-4 backdrop-blur-md">
              <div className="mx-auto flex max-w-3xl gap-3">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="输入你的问题..."
                  disabled={sending}
                  className="cosmic-input flex-1 rounded-xl px-4 py-3 text-sm"
                />
                <Button
                  variant="primary"
                  size="icon"
                  onClick={handleSend}
                  disabled={sending || !input.trim()}
                >
                  <Send className="size-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
