"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Bot, Send, Plus, Menu, X, Trash2, ChevronDown, ChevronUp, Brain } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button, IconButton } from "@/components/pouf/Button";
import { Skeleton } from "@/components/pouf/Skeleton";
import { api } from "@/lib/api";
import { getToken, clearSession } from "@/lib/session";
import { streamAiChat } from "@ai-adolescent-mental-health/api-client";
import type { AiSession, AiMessage } from "@/lib/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api";

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

/** Local message for rendering (includes streaming reasoning) */
interface DisplayMessage extends AiMessage {
  /** Streaming reasoning content (not persisted) */
  reasoning?: string;
  /** Reasoning section is expanded by user */
  reasoningExpanded?: boolean;
}

export function AiChatPage() {
  const [sessions, setSessions] = useState<AiSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<number | null>(null);
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
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

    const userMessage: DisplayMessage = {
      id: Date.now(),
      role: "user",
      content: trimmed,
      createTime: new Date().toISOString(),
    };

    const assistantMessage: DisplayMessage = {
      id: Date.now() + 1,
      role: "assistant",
      content: "",
      reasoning: "",
      reasoningExpanded: true,
      createTime: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setInput("");
    setSending(true);

    try {
      let fullContent = "";
      let fullReasoning = "";
      await streamAiChat(
        sessionOptions(),
        activeSessionId,
        trimmed,
        (chunk, type) => {
          if (type === "reasoning") {
            fullReasoning += chunk;
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantMessage.id
                  ? { ...m, reasoning: fullReasoning }
                  : m
              )
            );
          } else {
            fullContent += chunk;
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantMessage.id
                  ? { ...m, content: fullContent }
                  : m
              )
            );
          }
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

  const toggleReasoning = (msgId: number) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === msgId ? { ...m, reasoningExpanded: !m.reasoningExpanded } : m
      )
    );
  };

  return (
    <div className="relative flex h-[calc(100dvh-9rem)]">
      {/* Mobile sidebar toggle */}
      <button
        type="button"
        className="fixed left-4 top-20 z-30 rounded-control border border-[rgba(201,168,255,0.3)] bg-surface/90 p-3 backdrop-blur-md text-ink lg:hidden"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X className="size-5 text-muted" /> : <Menu className="size-5 text-muted" />}
      </button>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-[rgba(58,46,92,0.35)] backdrop-blur-[2px] lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Session Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-20 w-64 transform border-r border-[rgba(201,168,255,0.3)] bg-surface/90 backdrop-blur-md transition-transform lg:relative lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-[rgba(201,168,255,0.3)] p-4">
            <h2 className="font-black text-ink">会话列表</h2>
            <IconButton icon={<Plus className="size-4" />} label="新建会话" size="sm" variant="quiet" onClick={handleCreateSession} />
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {loadingSessions ? (
              <div className="space-y-2 p-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : sessions.length === 0 ? (
              <div className="p-4 text-center text-sm font-bold text-muted">
                暂无会话，点击 + 创建
              </div>
            ) : (
              sessions.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => { setActiveSessionId(s.id); setSidebarOpen(false); }}
                  className={`w-full rounded-control px-3 py-2 text-left text-sm transition-colors ${
                    activeSessionId === s.id
                      ? "bg-purple/20 text-ink"
                      : "text-muted hover:bg-purple/10 hover:text-ink"
                  }`}
                >
                  <div className="truncate font-bold">{s.title}</div>
                  <div className="text-xs text-muted/70">{s.createTime}</div>
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
              <Bot className="mx-auto mb-4 size-16 text-purple/40" />
              <p className="text-lg font-bold text-muted">选择一个会话或创建新会话</p>
              <div className="mt-4">
                <Button tone="purple" onClick={handleCreateSession}>
                  <Plus className="mr-1 size-4" />
                  新建会话
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-4 py-6">
              {loadingMessages ? (
                <div className="mx-auto max-w-3xl space-y-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}>
                      <Skeleton className={`h-16 rounded-control ${i % 2 === 0 ? "w-2/3" : "w-3/4"}`} />
                    </div>
                  ))}
                </div>
              ) : messages.length === 0 ? (
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <Bot className="mx-auto mb-4 size-12 text-purple/40" />
                    <p className="font-bold text-muted">开始和 AI 咨询师对话吧</p>
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
                        className={`max-w-[85%] rounded-[18px] px-4 py-3 text-sm ${
                          msg.role === "user"
                            ? "bg-purple text-[var(--on-accent)]"
                            : "cushion-card border border-[rgba(201,168,255,0.3)] bg-surface text-ink"
                        }`}
                      >
                        {/* Reasoning section (visible for assistant messages with reasoning) */}
                        {msg.role === "assistant" && msg.reasoning && (
                          <div className="mb-3 overflow-hidden rounded-control border border-[rgba(201,168,255,0.3)] bg-purple/10">
                            <button
                              type="button"
                              onClick={() => toggleReasoning(msg.id)}
                              className="flex w-full items-center gap-2 px-3 py-2 text-xs font-bold text-muted transition-colors hover:bg-purple/15"
                            >
                              <Brain className="size-3.5" />
                              <span className="flex-1 text-left">思考过程</span>
                              {msg.reasoningExpanded !== false ? (
                                <ChevronUp className="size-3.5" />
                              ) : (
                                <ChevronDown className="size-3.5" />
                              )}
                            </button>
                            {(msg.reasoningExpanded !== false) && (
                              <div className="px-3 pb-3 text-xs text-muted/80 whitespace-pre-wrap leading-relaxed">
                                {msg.reasoning}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Message content */}
                        {msg.content ? (
                          msg.role === "assistant" ? (
                            <div className="prose prose-sm max-w-none
                              prose-headings:text-ink prose-headings:font-bold
                              prose-p:text-ink/80 prose-p:leading-relaxed
                              prose-strong:text-ink prose-strong:font-bold
                              prose-a:text-blue prose-a:no-underline hover:prose-a:underline
                              prose-code:text-ink prose-code:bg-purple/20 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-xs
                              prose-pre:bg-bg prose-pre:border prose-pre:border-[rgba(201,168,255,0.3)] prose-pre:rounded-xl prose-pre:text-ink
                              prose-blockquote:border-l-blue/60 prose-blockquote:bg-bg prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-blockquote:not-italic
                              prose-li:text-ink/80
                              prose-hr:border-[rgba(201,168,255,0.3)]
                              [&_*]:scroll-mt-24
                            ">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {msg.content}
                              </ReactMarkdown>
                            </div>
                          ) : (
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                          )
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-muted/70">
                            <span className="size-1.5 animate-pulse rounded-full bg-purple" />
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
            <div className="border-t border-[rgba(201,168,255,0.3)] bg-bg/60 p-4">
              <div className="mx-auto flex max-w-3xl gap-3">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="输入你的问题..."
                  disabled={sending}
                  className="cushion-field flex-1 rounded-control bg-surface px-4 py-3 text-sm font-bold text-ink placeholder:text-muted focus-visible:cushion-field-focus focus-visible:outline-none"
                />
                <IconButton
                  icon={<Send className="size-4" />}
                  label="发送"
                  tone="purple"
                  variant="solid"
                  onClick={handleSend}
                  disabled={sending || !input.trim()}
                />
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
