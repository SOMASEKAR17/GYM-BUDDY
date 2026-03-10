"use client";
import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { Send, ArrowLeft, Check, CheckCheck, User } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { toast } from "react-hot-toast";

interface Message {
  id: string;
  content: string;
  senderId: string;
  seen: boolean;
  createdAt: string;
  sender: { id: string; name: string; profileImage?: string };
}

interface MatchInfo {
  matchId: string;
  partner: { id: string; name: string; gymLocation?: string; fitnessGoal?: string; profileImage?: string };
}

export default function ChatPage() {
  const { matchId } = useParams<{ matchId: string }>();
  const router = useRouter();
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [matchInfo, setMatchInfo] = useState<MatchInfo | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval>>(null);

  useEffect(() => {
    loadMessages();
    loadMatchInfo();

    // Poll for new messages every 3s
    pollRef.current = setInterval(loadMessages, 3000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadMessages = async () => {
    try {
      const res = await fetch(`/api/messages/${matchId}`);
      if (!res.ok) return;
      const data = await res.json();
      setMessages(data.messages || []);
    } finally {
      setLoading(false);
    }
  };

  const loadMatchInfo = async () => {
    const res = await fetch("/api/matches");
    const data = await res.json();
    const match = data.matches?.find((m: MatchInfo) => m.matchId === matchId);
    if (match) setMatchInfo(match);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    const content = input.trim();
    setInput("");
    setSending(true);

    // Optimistic update
    const tempMsg: Message = {
      id: `temp-${Date.now()}`,
      content,
      senderId: user!.id,
      seen: false,
      createdAt: new Date().toISOString(),
      sender: { id: user!.id, name: user!.name },
    };
    setMessages((prev) => [...prev, tempMsg]);

    try {
      const res = await fetch(`/api/messages/${matchId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) {
        toast.error("Failed to send message");
        setMessages((prev) => prev.filter((m) => m.id !== tempMsg.id));
      } else {
        const data = await res.json();
        setMessages((prev) => prev.map((m) => (m.id === tempMsg.id ? data.message : m)));
      }
    } finally {
      setSending(false);
    }
  };

  const partner = matchInfo?.partner;

  return (
    <div style={{ height: "calc(100vh - 64px)", display: "flex", flexDirection: "column", maxWidth: "800px", margin: "0 auto", padding: "0 24px" }}>
      {/* Chat header */}
      <div
        className="glass-card"
        style={{
          padding: "16px 20px",
          margin: "16px 0 0",
          display: "flex",
          alignItems: "center",
          gap: "14px",
          borderRadius: "12px 12px 0 0",
          borderBottom: "none",
          flexShrink: 0,
        }}
      >
        <button onClick={() => router.push("/matches")} style={{ background: "none", border: "none", color: "var(--color-text-muted)", cursor: "pointer", display: "flex", alignItems: "center" }}>
          <ArrowLeft size={20} />
        </button>
        <div style={{ 
          width: 42, height: 42, borderRadius: "50%", 
          background: partner?.profileImage ? `url(${partner.profileImage})` : "linear-gradient(135deg, var(--color-accent), var(--color-accent-dark))", 
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex", alignItems: "center", justifyContent: "center", color: "white" 
        }}>
          {!partner?.profileImage && <User size={20} />}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: "15px" }}>{partner?.name || "Loading..."}</div>
          {partner?.gymLocation && <div style={{ fontSize: "12px", color: "var(--color-accent)" }}>📍 {partner.gymLocation}</div>}
        </div>
        <div style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>Gym Partner</div>
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px 20px",
          background: "rgba(13,13,13,0.6)",
          backdropFilter: "blur(8px)",
          border: "1px solid var(--color-border-subtle)",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
            <div className="spinner" />
          </div>
        ) : messages.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: "12px" }}>
            <div style={{ fontSize: "40px" }}>👋</div>
            <p style={{ color: "var(--color-text-secondary)", fontSize: "14px" }}>You matched! Say hello and plan your first session.</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === user?.id;
            return (
              <div key={msg.id} style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start", gap: "8px", alignItems: "flex-end" }}>
                {!isMe && (
                  <div style={{ 
                    width: 28, height: 28, borderRadius: "50%", 
                    background: msg.sender.profileImage ? `url(${msg.sender.profileImage})` : "linear-gradient(135deg, #555, #333)", 
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    display: "flex", alignItems: "center", justifyContent: "center", color: "white", flexShrink: 0 
                  }}>
                    {!msg.sender.profileImage && <User size={14} />}
                  </div>
                )}
                <div style={{ maxWidth: "65%" }}>
                  <div style={{
                    padding: "10px 14px",
                    borderRadius: isMe ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                    background: isMe ? "var(--color-accent)" : "rgba(255,255,255,0.07)",
                    border: `1px solid ${isMe ? "transparent" : "var(--color-border-subtle)"}`,
                    fontSize: "14px",
                    lineHeight: 1.5,
                    color: "white",
                  }}>
                    {msg.content}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "4px", justifyContent: isMe ? "flex-end" : "flex-start" }}>
                    <span style={{ fontSize: "10px", color: "var(--color-text-muted)" }}>
                      {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                    </span>
                    {isMe && (
                      msg.seen
                        ? <CheckCheck size={12} color="var(--color-accent)" />
                        : <Check size={12} color="var(--color-text-muted)" />
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={sendMessage}
        style={{
          display: "flex",
          gap: "10px",
          padding: "12px 16px",
          background: "rgba(22,22,22,0.9)",
          backdropFilter: "blur(8px)",
          border: "1px solid var(--color-border-subtle)",
          borderTop: "none",
          borderRadius: "0 0 12px 12px",
          marginBottom: "16px",
          flexShrink: 0,
        }}
      >
        <input
          id="chat-input"
          className="form-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Message ${partner?.name || "your partner"}...`}
          style={{ flex: 1 }}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage(e as unknown as React.FormEvent)}
        />
        <button
          id="chat-send-btn"
          type="submit"
          disabled={!input.trim() || sending}
          className="btn-primary"
          style={{ padding: "10px 16px", flexShrink: 0, display: "flex", alignItems: "center", gap: "6px", opacity: !input.trim() ? 0.5 : 1 }}
        >
          <Send size={16} />
        </button>
      </form>
    </div>

  );
}
