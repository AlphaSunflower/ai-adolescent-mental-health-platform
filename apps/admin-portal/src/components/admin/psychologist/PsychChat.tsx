"use client";

import { useState, useEffect, useRef } from "react";
import { httpClient } from "@/lib/api-admin";
import { getToken } from "@/lib/session";

import { s } from "@/lib/design-tokens";

interface Conversation {
  appointmentId: number; userId: number; userName: string; psychologistId?: number;
  serviceType: string; status: number; lastMessage: string; lastTime: string;
}

interface Message {
  id: number; senderType: string; content: string; createTime: string; contentType: number;
}

function getStatusLabel(st: number): string {
  const map: Record<number, string> = { 0: "待审核", 1: "已确认", 2: "已拒绝", 3: "进行中", 4: "已完成", 5: "已取消", 6: "已爽约", 7: "待进行", 8: "已评价" };
  return map[st] ?? String(st);
}

export function PsychChat() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api";

  const extractUserName = (c: Record<string, unknown>): string => {
    if (c.userName) return String(c.userName);
    if (c.userNickname) return String(c.userNickname);
    try {
      const info = typeof c.userBasicInfo === "string" ? JSON.parse(c.userBasicInfo as string) : c.userBasicInfo;
      if (info && typeof info === "object") {
        const r = info as Record<string, unknown>;
        if (r.name) return String(r.name);
        if (r.nickname) return String(r.nickname);
        if (r.realName) return String(r.realName);
      }
    } catch { /* ignore */ }
    if (c.userProblems) return String(c.userProblems).slice(0, 15);
    return "用户" + String(c.userId || "");
  };

  const fetchConversations = () => {
    setLoading(true); setError(null);
    httpClient.get<Record<string, unknown>[]>("/psychologist/message/conversations")
      .then((raw) => {
        const convs: Conversation[] = Array.isArray(raw) ? raw.map((c) => ({
          appointmentId: c.appointmentId as number,
          userId: c.userId as number,
          userName: extractUserName(c),
          psychologistId: c.psychologistId as number,
          serviceType: c.serviceType as string,
          status: c.status as number,
          lastMessage: (c.lastMessage as string) || (c.userProblems as string) || "",
          lastTime: (c.lastTime as string) || (c.createTime as string) || "",
        })) : [];
        setConversations(convs);
      })
      .catch((err: unknown) => { setError(err instanceof Error ? err.message : "Unknown error"); })
      .finally(() => setLoading(false));
  };

  const fetchMessages = (appointmentId: number) => {
    httpClient.get<Record<string, unknown>[]>(`/psychologist/admin/messages/${appointmentId}`)
      .then((res) => {
        setMessages(Array.isArray(res) ? res.map((m) => ({
          id: m.id as number,
          senderType: m.senderType as string,
          content: m.content as string,
          createTime: m.createTime as string,
          contentType: m.contentType as number,
        })) : []);
      })
      .catch(() => {});
  };

  // SSE subscription for real-time messages
  useEffect(() => {
    if (!activeConv?.psychologistId) return;
    const token = getToken();
    const url = `${BASE_URL.replace(/\/$/, "")}/psychologist/message/stream/psychologist/${activeConv.psychologistId}?token=${token || ""}`;

    const es = new EventSource(url);
    eventSourceRef.current = es;

    es.addEventListener("message", (event: MessageEvent) => {
      try {
        const raw = JSON.parse(event.data);
        const msg: Message = {
          id: raw.id as number,
          senderType: (raw.senderId === activeConv.psychologistId) ? "psychologist" : "user",
          content: raw.content as string,
          createTime: raw.createTime as string,
          contentType: raw.contentType as number,
        };
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      } catch { /* ignore */ }
    });

    es.onerror = () => {
      es.close();
    };

    return () => {
      es.close();
    };
  }, [activeConv?.appointmentId, activeConv?.psychologistId]);

  useEffect(() => { fetchConversations(); }, []);
  useEffect(() => { if (activeConv) { fetchMessages(activeConv.appointmentId); } }, [activeConv]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim() || !activeConv) return;
    setSending(true);
    try {
      await httpClient.post("/psychologist/admin/messages/send", { appointmentId: activeConv.appointmentId, content: inputText, type: "TEXT" });
      setInputText("");
    } catch (err: unknown) { setError(err instanceof Error ? err.message : "Unknown error"); }
    finally { setSending(false); }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeConv) return;
    if (file.size > 5 * 1024 * 1024) { setError("图片不能超过 5MB"); return; }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const token = getToken();
      const res = await fetch(`${BASE_URL.replace(/\/$/, "")}/common/upload`, {
        method: "POST",
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: formData,
      });
      const data = await res.json() as { code: number; data: string; message?: string };
      if (data.code === 200 && data.data) {
        await httpClient.post("/psychologist/admin/messages/send", {
          appointmentId: activeConv.appointmentId,
          content: data.data,
          type: "image",
        });
      } else {
        setError("图片上传失败");
      }
    } catch {
      setError("图片上传失败");
    }
    setUploading(false);
  };

  return (
    <div style={{ padding: "20px", backgroundColor: s.bg, minHeight: "100%", display: "flex", gap: "16px", height: "calc(100vh - 100px)" }}>
      {/* Conversation list */}
      <div style={{ width: "320px", flexShrink: 0, backgroundColor: s.white, borderRadius: "8px", boxShadow: s.shadow, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "16px", borderBottom: "1px solid " + s.border }}>
          <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 600, color: s.text }}>会话列表</h3>
        </div>

        {error && (
          <div style={{ padding: "10px 16px", backgroundColor: "#fef0f0", color: s.red, fontSize: "13px" }}>
            {error}
            <button onClick={() => setError(null)} style={{ marginLeft: "12px", color: s.red, border: "none", background: "none", cursor: "pointer" }}>关闭</button>
          </div>
        )}

        <div style={{ flex: 1, overflow: "auto" }}>
          {loading ? (
            <div key="loading" style={{ padding: "40px", textAlign: "center", color: s.text3 }}>加载中...</div>
          ) : conversations.length === 0 ? (
            <div key="empty" style={{ padding: "40px", textAlign: "center", color: s.text3 }}>暂无会话</div>
          ) : (
            conversations.map((conv) => (
              <div key={conv.appointmentId}
                onClick={() => setActiveConv(conv)}
                style={{
                  padding: "14px 16px", cursor: "pointer", borderBottom: "1px solid " + s.border,
                  backgroundColor: activeConv?.appointmentId === conv.appointmentId ? s.primary + "10" : s.white,
                  borderLeft: activeConv?.appointmentId === conv.appointmentId ? "3px solid " + s.primary : "3px solid transparent",
                }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                  <span style={{ fontSize: "14px", fontWeight: 600, color: s.text }}>{conv.userName}</span>
                  <span style={{ fontSize: "11px", color: s.text3 }}>{conv.lastTime}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "12px", color: s.text3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "180px" }}>{conv.lastMessage || getStatusLabel(conv.status)}</span>
                  <span style={{ fontSize: "11px", color: s.primary }}>{getStatusLabel(conv.status)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat area */}
      <div style={{ flex: 1, backgroundColor: s.white, borderRadius: "8px", boxShadow: s.shadow, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {activeConv ? (
          <>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid " + s.border }}>
              <span style={{ fontSize: "15px", fontWeight: 600, color: s.text }}>{activeConv.userName}</span>
              <span style={{ fontSize: "12px", color: s.text3, marginLeft: "10px" }}>{getStatusLabel(activeConv.status)}</span>
            </div>

            <div style={{ flex: 1, overflow: "auto", padding: "16px" }}>
              {messages.length === 0 ? (
                <div key="no-msg" style={{ textAlign: "center", color: s.text3, padding: "40px" }}>暂无消息</div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} style={{
                    display: "flex", justifyContent: msg.senderType === "psychologist" ? "flex-end" : "flex-start", marginBottom: "12px",
                  }}>
                    <div style={{
                      maxWidth: "70%", padding: "10px 14px", borderRadius: "12px",
                      backgroundColor: msg.senderType === "psychologist" ? s.primary + "10" : s.bg,
                      color: s.text, fontSize: "13px", lineHeight: 1.5, wordBreak: "break-word",
                    }}>
                      {msg.contentType === 1 ? (
                        <img src={msg.content} alt="" style={{ maxWidth: "100%", borderRadius: "8px" }} />
                      ) : (
                        msg.content
                      )}
                      <div style={{ fontSize: "10px", color: s.text3, marginTop: "4px" }}>{msg.createTime}</div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <div style={{ padding: "12px 20px", borderTop: "1px solid " + s.border, display: "flex", gap: "10px", alignItems: "center" }}>
              {/* Image upload button */}
              <label style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                width: "36px", height: "36px", borderRadius: "50%",
                border: "1px solid " + s.border, cursor: "pointer",
                color: s.text3, opacity: uploading ? 0.5 : 1,
              }} title="发送图片">
                {uploading ? (
                  <span style={{ fontSize: "12px" }}>⏳</span>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                )}
                <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} style={{ display: "none" }} />
              </label>
              <input value={inputText} onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder="输入消息..."
                style={{ flex: 1, height: "40px", padding: "0 14px", border: "1px solid " + s.border, borderRadius: "20px", fontSize: "13px", outline: "none" }} />
              <button onClick={handleSend} disabled={sending || !inputText.trim()}
                style={{ height: "40px", padding: "0 24px", backgroundColor: s.primary, color: s.white, border: "none", borderRadius: "20px", cursor: "pointer", fontSize: "13px", opacity: sending ? 0.7 : 1 }}>
                {sending ? "发送中" : "发送"}
              </button>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: s.text3, fontSize: "14px" }}>
            请选择一个会话开始聊天
          </div>
        )}
      </div>
    </div>
  );
}
