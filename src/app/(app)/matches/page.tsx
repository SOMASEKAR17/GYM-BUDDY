"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { MessageSquare, Dumbbell, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface MatchItem {
  matchId: string;
  partner: {
    id: string;
    name: string;
    profileImage?: string;
    gymLocation?: string;
    fitnessGoal?: string;
    fitnessLevel?: string;
  };
  lastMessage?: {
    content: string;
    createdAt: string;
    seen: boolean;
    senderId: string;
  } | null;
  hasUnread: boolean;
  createdAt: string;
}

export default function MatchesPage() {
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/matches")
      .then((r) => r.json())
      .then((d) => { if (d.matches) setMatches(d.matches); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 24px" }}>
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "32px", fontWeight: 700, marginBottom: "8px" }}>
          YOUR <span className="text-gradient">MATCHES</span>
        </h1>
        <p style={{ color: "var(--color-text-secondary)", fontSize: "14px" }}>
          {matches.length} mutual connections · Start training together
        </p>
      </div>

      {matches.length === 0 ? (
        <div className="glass-card" style={{ padding: "64px", textAlign: "center" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>💪</div>
          <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "24px", marginBottom: "12px" }}>NO MATCHES YET</h2>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "14px", marginBottom: "24px", lineHeight: 1.6 }}>
            Head over to Discover to start swiping and find your gym partner.
          </p>
          <Link href="/discover">
            <button className="btn-primary">Discover Partners</button>
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {matches.map((match) => (
            <Link
              key={match.matchId}
              href={`/chat/${match.matchId}`}
              style={{ textDecoration: "none" }}
            >
              <div
                className="glass-card"
                style={{
                  padding: "16px 20px",
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  cursor: "pointer",
                  transition: "border-color 0.15s, transform 0.15s",
                  border: match.hasUnread ? "1px solid rgba(230,57,70,0.35)" : "1px solid var(--color-border-subtle)",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.borderColor = "rgba(230,57,71,0.4)";
                  el.style.transform = "translateX(4px)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.borderColor = match.hasUnread ? "rgba(230,57,71,0.35)" : "var(--color-border-subtle)";
                  el.style.transform = "translateX(0)";
                }}
              >
                {/* Avatar */}
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <div style={{
                    width: 52,
                    height: 52,
                    borderRadius: "50%",
                    background: match.partner.profileImage ? `url(${match.partner.profileImage})` : "linear-gradient(135deg, var(--color-accent), var(--color-accent-dark))",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                  }}>
                    {!match.partner.profileImage && <User size={24} />}
                  </div>
                  {match.hasUnread && (
                    <div style={{
                      position: "absolute",
                      bottom: 0,
                      right: 0,
                      width: 14,
                      height: 14,
                      background: "var(--color-accent)",
                      borderRadius: "50%",
                      border: "2px solid var(--color-bg-primary)",
                    }} />
                  )}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                    <span style={{ fontWeight: 600, fontSize: "15px" }}>{match.partner.name}</span>
                    {match.hasUnread && (
                      <span className="badge badge-red" style={{ fontSize: "10px", padding: "2px 6px" }}>New</span>
                    )}
                  </div>
                  <p style={{
                    fontSize: "13px",
                    color: match.hasUnread ? "var(--color-text-primary)" : "var(--color-text-muted)",
                    fontWeight: match.hasUnread ? 500 : 400,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    maxWidth: "100%",
                  }}>
                    {match.lastMessage ? match.lastMessage.content : "Say hello! 👋"}
                  </p>
                </div>

                {/* Meta */}
                <div style={{ flexShrink: 0, textAlign: "right" }}>
                  {match.lastMessage && (
                    <p style={{ fontSize: "11px", color: "var(--color-text-muted)", marginBottom: "6px" }}>
                      {formatDistanceToNow(new Date(match.lastMessage.createdAt), { addSuffix: true })}
                    </p>
                  )}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "6px" }}>
                    {match.partner.gymLocation && (
                      <span style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>{match.partner.gymLocation}</span>
                    )}
                    <MessageSquare size={14} color="var(--color-text-muted)" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Discover more CTA */}
      {matches.length > 0 && (
        <div className="glass-card" style={{ marginTop: "24px", padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ width: 40, height: 40, background: "rgba(230,57,70,0.1)", border: "1px solid rgba(230,57,71,0.2)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Dumbbell size={18} color="var(--color-accent)" />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 600, fontSize: "14px" }}>Looking for more?</p>
            <p style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>Discover more gym partners in the swipe section.</p>
          </div>
          <Link href="/discover">
            <button className="btn-outline" style={{ padding: "8px 16px", fontSize: "12px" }}>Discover</button>
          </Link>
        </div>
      )}
    </div>
  );
}
