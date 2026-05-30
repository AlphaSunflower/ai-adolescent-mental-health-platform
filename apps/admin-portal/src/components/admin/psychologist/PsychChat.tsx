"use client";

import { useState, useEffect, useRef } from "react";
import { httpClient } from "@/lib/api-admin";

const s = {
  primary: "#409eff", green: "#67c23a", orange: "#e6a23c", red: "#f56c6c",
  text: "#303133", text2: "#606266", text3: "#909399",
  border: "#dcdfe6", bg: "#f0f2f5", white: "#fff",
  radius: "4px", shadow: "0 2px 12px rgba(0,0,0,0.06)",
};

interface Conversation {
  appointmentId: number; userId: number; userName: string;
  serviceType: string; status: number; lastMessage: string; lastTime: string;
}

interface Message {
  id: number; senderType: string; content: string; createTime: string; contentType: string;
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
  const messagesEndRef = useRef<HTMLDivElement>(null);


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
    httpClient.get<Message[]>(`/psychologist/admin/messages/${appointmentId}`)
      .then((res) => setMessages(Array.isArray(res) ? res : []))
      .catch(() => {});
  };

  useEffect(() => { fetchConversations(); }, []);
  useEffect(() => { if (activeConv) { fetchMessages(activeConv.appointmentId); } }, [activeConv]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim() || !activeConv) return;
    setSending(true);
    try {
      await httpClient.post("/psychologist/admin/messages/send", { appointmentId: activeConv.appointmentId, content: inputText, type: "TEXT" });
      setInputText("");
      fetchMessages(activeConv.appointmentId);
    } catch (err: unknown) { setError(err instanceof Error ? err.message : "Unknown error"); }
    finally { setSending(false); }
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
                      {msg.content}
                      <div style={{ fontSize: "10px", color: s.text3, marginTop: "4px" }}>{msg.createTime}</div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <div style={{ padding: "12px 20px", borderTop: "1px solid " + s.border, display: "flex", gap: "10px" }}>
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
