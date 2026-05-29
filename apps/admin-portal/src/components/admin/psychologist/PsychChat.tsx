"use client";

import { useState, useEffect, useRef } from "react";
import { httpClient } from "@/lib/api-admin";

const s = {
  primary: "#409eff", green: "#67c23a", orange: "#e6a23c", red: "#f56c6c",
  text: "#303133", text2: "#606266", text3: "#909399",
  border: "#dcdfe6", bg: "#f0f2f5", white: "#fff",
  radius: "4px", shadow: "0 2px 12px rgba(0,0,0,0.06)",
  statCardBg: "#fff",
};

interface Conversation {
  id: number; userName: string; lastMessage: string; lastTime: string; unread: number;
}

interface Message {
  id: number; senderId: number; content: string; createTime: string;
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

  const fetchConversations = () => {
    setLoading(true); setError(null);
    httpClient.get<Conversation[]>("/psychologist/message/conversations")
      .then(setConversations)
      .catch((err: unknown) => { setError(err instanceof Error ? err.message : "Unknown error"); })
      .finally(() => setLoading(false));
  };

  const fetchMessages = (convId: number) => {
    httpClient.get<Message[]>("/psychologist/message/records", { query: { conversationId: convId } })
      .then(setMessages)
      .catch(() => {});
  };

  useEffect(() => { fetchConversations(); }, []);
  useEffect(() => { if (activeConv) { fetchMessages(activeConv.id); } }, [activeConv]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim() || !activeConv) return;
    setSending(true);
    try {
      await httpClient.post("/psychologist/message/send", { conversationId: activeConv.id, content: inputText });
      setInputText("");
      fetchMessages(activeConv.id);
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
            <div style={{ padding: "40px", textAlign: "center", color: s.text3 }}>加载中...</div>
          ) : conversations.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", color: s.text3 }}>暂无会话</div>
          ) : (
            conversations.map((conv) => (
              <div key={conv.id}
                onClick={() => setActiveConv(conv)}
                style={{
                  padding: "14px 16px", cursor: "pointer", borderBottom: "1px solid " + s.border,
                  backgroundColor: activeConv?.id === conv.id ? s.primary + "10" : s.white,
                  borderLeft: activeConv?.id === conv.id ? "3px solid " + s.primary : "3px solid transparent",
                }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                  <span style={{ fontSize: "14px", fontWeight: 600, color: s.text }}>{conv.userName}</span>
                  <span style={{ fontSize: "11px", color: s.text3 }}>{conv.lastTime}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "12px", color: s.text3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "200px" }}>{conv.lastMessage ?? ""}</span>
                  {conv.unread > 0 && (
                    <span style={{ display: "inline-block", minWidth: "18px", height: "18px", borderRadius: "9px", backgroundColor: s.red, color: s.white, fontSize: "11px", textAlign: "center", lineHeight: "18px", padding: "0 5px" }}>{conv.unread}</span>
                  )}
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
            </div>

            <div style={{ flex: 1, overflow: "auto", padding: "16px" }}>
              {messages.length === 0 ? (
                <div style={{ textAlign: "center", color: s.text3, padding: "40px" }}>暂无消息</div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} style={{
                    display: "flex", justifyContent: msg.senderId === 0 ? "flex-end" : "flex-start", marginBottom: "12px",
                  }}>
                    <div style={{
                      maxWidth: "70%", padding: "10px 14px", borderRadius: "12px",
                      backgroundColor: msg.senderId === 0 ? s.primary + "10" : s.bg,
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
