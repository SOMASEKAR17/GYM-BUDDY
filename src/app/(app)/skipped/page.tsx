"use client";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  Dumbbell, Clock, Target, MapPin, Heart, RotateCcw,
  Search, ChevronDown, ChevronUp,
} from "lucide-react";

interface SkippedProfile {
  id: string;
  swipeId: string;
  name: string;
  age?: number;
  gender?: string;
  bio?: string;
  gymLocation?: string;
  fitnessLevel?: string;
  fitnessGoal?: string;
  course?: string;
  year?: string;
  compatibilityScore: number;
  skippedAt: string;
  questionnaire?: {
    workoutSplit?: string;
    workoutTime?: string;
    workoutDuration?: string;
    trainingStyle?: string;
    daysPerWeek?: number;
  } | null;
}

type SortKey = "skippedAt" | "compatibilityScore" | "name";

export default function SkippedPage() {
  const [profiles, setProfiles] = useState<SkippedProfile[]>([]);
  const [filtered, setFiltered] = useState<SkippedProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [reconsidering, setReconsidering] = useState<string | null>(null);
  const [matched, setMatched] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("skippedAt");
  const [sortAsc, setSortAsc] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/discover/skipped");
        const data = await res.json();
        if (data.profiles) {
          setProfiles(data.profiles);
          setFiltered(data.profiles);
        }
      } catch {
        toast.error("Failed to load skipped profiles");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Filter + sort whenever search/sort changes
  useEffect(() => {
    let result = [...profiles];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.gymLocation?.toLowerCase().includes(q) ||
          p.fitnessGoal?.toLowerCase().includes(q) ||
          p.course?.toLowerCase().includes(q)
      );
    }
    result.sort((a, b) => {
      let diff = 0;
      if (sortKey === "compatibilityScore") diff = a.compatibilityScore - b.compatibilityScore;
      else if (sortKey === "name") diff = a.name.localeCompare(b.name);
      else diff = new Date(a.skippedAt).getTime() - new Date(b.skippedAt).getTime();
      return sortAsc ? diff : -diff;
    });
    setFiltered(result);
  }, [search, sortKey, sortAsc, profiles]);

  const handleReconsider = async (profile: SkippedProfile) => {
    setReconsidering(profile.id);
    try {
      const res = await fetch("/api/swipe/reconsider", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toUserId: profile.id }),
      });
      const data = await res.json();

      // Remove from skipped list
      setProfiles((prev) => prev.filter((p) => p.id !== profile.id));

      if (data.matched) {
        setMatched(profile.name);
        setTimeout(() => setMatched(null), 3500);
        toast.success(`🎉 It's a match with ${profile.name}!`);
      } else {
        toast.success(`Liked ${profile.name}! Waiting for them to match back.`);
      }
    } catch {
      toast.error("Failed to reconsider profile");
    } finally {
      setReconsidering(null);
    }
  };

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc((a) => !a);
    else { setSortKey(key); setSortAsc(false); }
  };

  const SortBtn = ({ label, k }: { label: string; k: SortKey }) => (
    <button
      onClick={() => toggleSort(k)}
      className={sortKey === k ? "btn-primary" : "btn-outline"}
      style={{
        padding: "6px 14px",
        fontSize: "12px",
        display: "flex",
        alignItems: "center",
        gap: "4px",
      }}
    >
      {label}
      {sortKey === k && (sortAsc ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
    </button>
  );

  /* ── Match animation overlay ── */
  if (matched) {
    return (
      <div
        className="fixed inset-0 z-[1000] flex items-center justify-center fade-in"
        style={{ background: "rgba(0,0,0,0.9)", backdropFilter: "blur(10px)" }}
      >
        <div className="text-center">
          <div style={{ fontSize: "80px", marginBottom: "16px" }}>🎉</div>
          <h2
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(36px,5vw,60px)",
              fontWeight: 700,
              marginBottom: "10px",
            }}
          >
            IT&apos;S A <span className="text-gradient">MATCH!</span>
          </h2>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "16px" }}>
            You and <strong style={{ color: "white" }}>{matched}</strong> both liked each other!
          </p>
        </div>
      </div>
    );
  }

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: "calc(100vh - 64px)" }}>
        <div className="text-center">
          <div className="spinner" style={{ margin: "0 auto 12px" }} />
          <p style={{ color: "var(--color-text-secondary)", fontSize: "14px" }}>
            Loading skipped profiles…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1100px] mx-auto px-4 md:px-8 py-8 md:py-12">

      {/* ── Header ── */}
      <div className="mb-8">
        <div className="badge badge-red mb-3 inline-flex gap-1.5">
          <RotateCcw size={11} /> Skipped Profiles
        </div>
        <h1
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "clamp(28px, 4vw, 44px)",
            fontWeight: 700,
            marginBottom: "8px",
          }}
        >
          YOUR <span className="text-gradient">PASS LIST</span>
        </h1>
        <p style={{ color: "var(--color-text-secondary)", fontSize: "14px", lineHeight: 1.6 }}>
          Had second thoughts? Like any profile below to reconsider — if they liked you too, it&apos;s a match!
        </p>
      </div>

      {/* ── Search + sort bar ── */}
      <div className="flex flex-wrap gap-3 items-center mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search
            size={15}
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--color-text-muted)",
            }}
          />
          <input
            className="form-input"
            style={{ paddingLeft: "36px" }}
            placeholder="Search by name, gym, goal…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          <span style={{ fontSize: "12px", color: "var(--color-text-muted)", alignSelf: "center" }}>Sort:</span>
          <SortBtn label="Recent" k="skippedAt" />
          <SortBtn label="Match %" k="compatibilityScore" />
          <SortBtn label="Name" k="name" />
        </div>
      </div>

      {/* ── Empty state ── */}
      {filtered.length === 0 && (
        <div
          className="glass-card text-center"
          style={{ padding: "64px 32px", maxWidth: "440px", margin: "0 auto" }}
        >
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>
            {profiles.length === 0 ? "🙌" : "🔍"}
          </div>
          <h2
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "22px",
              marginBottom: "10px",
            }}
          >
            {profiles.length === 0 ? "NO PASSES YET" : "NO RESULTS"}
          </h2>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "14px", lineHeight: 1.6 }}>
            {profiles.length === 0
              ? "You haven't skipped anyone yet. Go discover some profiles!"
              : "No skipped profiles match your search."}
          </p>
        </div>
      )}

      {/* ── Profile grid ── */}
      {filtered.length > 0 && (
        <>
          <p style={{ fontSize: "12px", color: "var(--color-text-muted)", marginBottom: "16px" }}>
            {filtered.length} profile{filtered.length !== 1 ? "s" : ""} skipped
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {filtered.map((profile) => {
              const isExpanded = expanded === profile.id;
              const isProcessing = reconsidering === profile.id;
              const avatarLetter = profile.name.charAt(0).toUpperCase();
              const isHighMatch = profile.compatibilityScore >= 70;

              return (
                <div
                  key={profile.id}
                  className="glass-card fade-in"
                  style={{
                    overflow: "hidden",
                    border: isHighMatch
                      ? "1px solid var(--color-border-accent)"
                      : "1px solid var(--color-border-subtle)",
                    transition: "border-color 0.2s, transform 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                  }}
                >
                  {/* Card top band */}
                  <div
                    style={{
                      height: "90px",
                      background: `linear-gradient(135deg, rgba(${isHighMatch ? "230,57,70" : "40,40,60"},0.25), rgba(10,10,10,0.9))`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      position: "relative",
                    }}
                  >
                    {/* Avatar */}
                    <div
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #E63946, #C1121F)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontFamily: "var(--font-heading)",
                        fontSize: "24px",
                        fontWeight: 700,
                        color: "white",
                        boxShadow: "0 0 20px rgba(230,57,70,0.35)",
                      }}
                    >
                      {avatarLetter}
                    </div>

                    {/* Match % badge */}
                    <div
                      style={{
                        position: "absolute",
                        top: "10px",
                        right: "10px",
                        background: isHighMatch ? "rgba(230,57,70,0.9)" : "rgba(0,0,0,0.65)",
                        backdropFilter: "blur(6px)",
                        borderRadius: "6px",
                        padding: "4px 10px",
                        textAlign: "center",
                        border: "1px solid rgba(255,255,255,0.08)",
                      }}
                    >
                      <div
                        style={{
                          fontFamily: "var(--font-heading)",
                          fontSize: "16px",
                          fontWeight: 700,
                          color: "white",
                        }}
                      >
                        {profile.compatibilityScore}%
                      </div>
                      <div style={{ fontSize: "8px", color: "rgba(255,255,255,0.6)", textTransform: "uppercase" }}>
                        Match
                      </div>
                    </div>

                    {/* Skipped timestamp */}
                    <div
                      style={{
                        position: "absolute",
                        top: "10px",
                        left: "10px",
                        fontSize: "10px",
                        color: "rgba(255,255,255,0.4)",
                      }}
                    >
                      {new Date(profile.skippedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </div>
                  </div>

                  {/* Card body */}
                  <div style={{ padding: "16px" }}>
                    <div style={{ marginBottom: "10px" }}>
                      <h3
                        style={{
                          fontFamily: "var(--font-heading)",
                          fontSize: "18px",
                          fontWeight: 700,
                          marginBottom: "2px",
                        }}
                      >
                        {profile.name}
                      </h3>
                      <div style={{ display: "flex", gap: "8px", fontSize: "12px", color: "var(--color-text-secondary)" }}>
                        {profile.course && <span>{profile.course}</span>}
                        {profile.year && <span>• {profile.year}</span>}
                        {profile.age && <span>• {profile.age} yrs</span>}
                      </div>
                    </div>

                    {profile.gymLocation && (
                      <div
                        className="flex items-center gap-1.5 mb-3"
                        style={{ fontSize: "12px", color: "var(--color-accent)" }}
                      >
                        <MapPin size={11} /> {profile.gymLocation}
                      </div>
                    )}

                    {/* Mini stats */}
                    <div className="grid grid-cols-3 gap-1.5 mb-3">
                      {[
                        {
                          icon: <Dumbbell size={10} />,
                          label: "Split",
                          value: profile.questionnaire?.workoutSplit
                            ?.replace("Push Pull Legs", "PPL")
                            .replace("Upper / Lower", "U/L") || "—",
                        },
                        {
                          icon: <Clock size={10} />,
                          label: "Time",
                          value: profile.questionnaire?.workoutTime?.split(" ")[0] || "—",
                        },
                        {
                          icon: <Target size={10} />,
                          label: "Goal",
                          value: profile.fitnessGoal?.split(" ")[0] || "—",
                        },
                      ].map((s) => (
                        <div
                          key={s.label}
                          className="rounded-lg text-center"
                          style={{
                            background: "rgba(255,255,255,0.03)",
                            border: "1px solid var(--color-border-subtle)",
                            padding: "6px 4px",
                          }}
                        >
                          <div style={{ color: "var(--color-accent)", display: "flex", justifyContent: "center", marginBottom: "2px" }}>
                            {s.icon}
                          </div>
                          <div style={{ fontSize: "11px", fontWeight: 600, color: "white" }}>{s.value}</div>
                          <div style={{ fontSize: "9px", color: "var(--color-text-muted)", textTransform: "uppercase" }}>
                            {s.label}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {profile.fitnessLevel && (
                        <span className="badge badge-red" style={{ fontSize: "10px", padding: "2px 8px" }}>
                          {profile.fitnessLevel}
                        </span>
                      )}
                      {profile.questionnaire?.trainingStyle && (
                        <span
                          style={{
                            padding: "2px 8px",
                            background: "rgba(255,255,255,0.05)",
                            border: "1px solid var(--color-border-subtle)",
                            borderRadius: "100px",
                            fontSize: "10px",
                            color: "var(--color-text-secondary)",
                          }}
                        >
                          {profile.questionnaire.trainingStyle}
                        </span>
                      )}
                      {profile.questionnaire?.daysPerWeek && (
                        <span
                          style={{
                            padding: "2px 8px",
                            background: "rgba(255,255,255,0.05)",
                            border: "1px solid var(--color-border-subtle)",
                            borderRadius: "100px",
                            fontSize: "10px",
                            color: "var(--color-text-secondary)",
                          }}
                        >
                          {profile.questionnaire.daysPerWeek}d/wk
                        </span>
                      )}
                    </div>

                    {/* Expandable bio */}
                    {profile.bio && (
                      <div style={{ marginBottom: "12px" }}>
                        <p
                          style={{
                            fontSize: "12px",
                            color: "var(--color-text-secondary)",
                            lineHeight: 1.6,
                            borderTop: "1px solid var(--color-border-subtle)",
                            paddingTop: "10px",
                            overflow: "hidden",
                            display: "-webkit-box",
                            WebkitBoxOrient: "vertical",
                            WebkitLineClamp: isExpanded ? undefined : 2,
                          }}
                        >
                          &ldquo;{profile.bio}&rdquo;
                        </p>
                        {profile.bio.length > 80 && (
                          <button
                            onClick={() => setExpanded(isExpanded ? null : profile.id)}
                            style={{
                              fontSize: "11px",
                              color: "var(--color-accent)",
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              padding: "2px 0",
                              marginTop: "2px",
                            }}
                          >
                            {isExpanded ? "Show less" : "Read more"}
                          </button>
                        )}
                      </div>
                    )}

                    {/* Compatibility bar */}
                    <div style={{ marginBottom: "14px" }}>
                      <div
                        className="flex justify-between mb-1"
                        style={{ fontSize: "10px", color: "var(--color-text-muted)" }}
                      >
                        <span>Compatibility</span>
                        <span style={{ color: "var(--color-accent)", fontWeight: 600 }}>
                          {profile.compatibilityScore}%
                        </span>
                      </div>
                      <div
                        style={{
                          height: "3px",
                          background: "rgba(255,255,255,0.06)",
                          borderRadius: "2px",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: `${profile.compatibilityScore}%`,
                            background: "linear-gradient(90deg, #C1121F, #E63946)",
                            borderRadius: "2px",
                            transition: "width 0.8s ease",
                          }}
                        />
                      </div>
                    </div>

                    {/* Reconsider button */}
                    <button
                      id={`reconsider-${profile.id}`}
                      onClick={() => handleReconsider(profile)}
                      disabled={isProcessing}
                      className="btn-primary"
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        padding: "11px",
                        fontSize: "13px",
                        opacity: isProcessing ? 0.7 : 1,
                      }}
                    >
                      {isProcessing ? (
                        <><div className="spinner" style={{ width: 14, height: 14 }} /> Processing…</>
                      ) : (
                        <><Heart size={14} fill="white" /> Like &amp; Reconsider</>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
