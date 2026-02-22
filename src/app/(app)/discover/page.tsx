"use client";
import { useState, useEffect, useRef } from "react";
import { toast } from "react-hot-toast";
import { X, Heart, Dumbbell, Clock, Target, Star, MapPin, ChevronLeft, ChevronRight, User } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

interface Candidate {
  id: string;
  name: string;
  age?: number;
  gender?: string;
  bio?: string;
  gymLocation?: string;
  fitnessLevel?: string;
  fitnessGoal?: string;
  profileImage?: string;
  course?: string;
  year?: string;
  compatibilityScore: number;
  questionnaire?: {
    workoutSplit?: string;
    workoutTime?: string;
    workoutDuration?: string;
    trainingStyle?: string;
    daysPerWeek?: number;
  } | null;
}

export default function DiscoverPage() {
  const { user } = useAuthStore();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [swiping, setSwiping] = useState<"left" | "right" | null>(null);
  const [matchAnimation, setMatchAnimation] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const currentX = useRef(0);
  const isDragging = useRef(false);

  useEffect(() => {
    loadCandidates();
  }, []);

  const loadCandidates = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/discover/candidates?limit=20");
      const data = await res.json();
      if (data.candidates) setCandidates(data.candidates);
    } catch {
      toast.error("Failed to load candidates");
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (liked: boolean) => {
    if (currentIndex >= candidates.length) return;
    const candidate = candidates[currentIndex];
    setSwiping(liked ? "right" : "left");

    try {
      const res = await fetch("/api/swipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toUserId: candidate.id, liked }),
      });
      const data = await res.json();

      if (data.matched) {
        setTimeout(() => {
          setMatchAnimation(true);
          setTimeout(() => setMatchAnimation(false), 3000);
        }, 400);
      }
    } catch {
      toast.error("Failed to process swipe");
    }

    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
      setSwiping(null);
      if (cardRef.current) {
        cardRef.current.style.transform = "";
        cardRef.current.style.opacity = "";
      }
    }, 350);
  };

  // Touch/drag support
  const onMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    startX.current = e.clientX;
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !cardRef.current) return;
    currentX.current = e.clientX - startX.current;
    const rotate = currentX.current * 0.05;
    cardRef.current.style.transform = `translateX(${currentX.current}px) rotate(${rotate}deg)`;
    cardRef.current.style.opacity = String(1 - Math.abs(currentX.current) / 400);
  };

  const onMouseUp = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const threshold = 80;
    if (currentX.current > threshold) handleSwipe(true);
    else if (currentX.current < -threshold) handleSwipe(false);
    else {
      if (cardRef.current) {
        cardRef.current.style.transform = "";
        cardRef.current.style.opacity = "";
      }
    }
    currentX.current = 0;
  };

  const current = candidates[currentIndex];
  const next = candidates[currentIndex + 1];



  if (loading) {
    return (
      <div style={{ minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 48, height: 48, background: "rgba(230,57,70,0.1)", border: "1px solid rgba(230,57,70,0.2)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <Dumbbell size={24} color="var(--color-accent)" />
          </div>
          <div className="spinner" style={{ margin: "0 auto 12px" }} />
          <p style={{ color: "var(--color-text-secondary)", fontSize: "14px" }}>Finding your partners...</p>
        </div>
      </div>
    );
  }

  if (!current || currentIndex >= candidates.length) {
    return (
      <div style={{ minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="glass-card" style={{ padding: "48px", textAlign: "center", maxWidth: "400px" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🏋️</div>
          <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "24px", marginBottom: "12px" }}>ALL CAUGHT UP!</h2>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "14px", marginBottom: "24px", lineHeight: 1.6 }}>
            You&apos;ve seen all available profiles. Check back soon as more VIT students join GymBuddy.
          </p>
          <button className="btn-primary" onClick={() => { setCurrentIndex(0); loadCandidates(); }}>
            Refresh Profiles
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden" style={{ minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", position: "relative" }}>
      {/* Background */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(230,57,71,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(230,57,71,0.02) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

      {/* Match animation overlay */}
      {matchAnimation && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)"
        }}>
          <div className="fade-in" style={{ textAlign: "center", maxWidth: "400px", padding: "0 20px" }}>
            <div className="flex items-center justify-center gap-4 mb-6">
              <div style={{ 
                width: 80, height: 80, borderRadius: "50%", 
                background: user?.profileImage ? `url(${user.profileImage})` : "linear-gradient(135deg, var(--color-accent), var(--color-accent-dark))",
                backgroundSize: "cover", backgroundPosition: "center",
                border: "3px solid white", boxShadow: "0 0 20px rgba(230,57,70,0.5)"
              }}>
                {!user?.profileImage && <User size={40} color="white" />}
              </div>
              <div style={{ fontSize: "32px" }}>❤️</div>
              <div style={{ 
                width: 80, height: 80, borderRadius: "50%", 
                background: current?.profileImage ? `url(${current.profileImage})` : "linear-gradient(135deg, var(--color-accent), var(--color-accent-dark))",
                backgroundSize: "cover", backgroundPosition: "center",
                border: "3px solid white", boxShadow: "0 0 20px rgba(230,57,70,0.5)"
              }}>
                {!current?.profileImage && <User size={40} color="white" />}
              </div>
            </div>
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "40px", fontWeight: 700, marginBottom: "8px" }}>
              IT&apos;S A <span className="text-gradient">MATCH!</span>
            </h2>
            <p style={{ color: "var(--color-text-secondary)", fontSize: "16px", lineHeight: 1.5 }}>
              You and {current?.name} both liked each other. Head over to matches to start chatting!
            </p>
            <button 
              className="btn-primary mt-8 w-full" 
              onClick={() => setMatchAnimation(false)}
            >
              Keep Swiping
            </button>
          </div>
        </div>
      )}

      <div
        style={{ width: "100%", maxWidth: "900px", position: "relative", zIndex: 1 }} 
        className="flex flex-col md:grid md:grid-cols-[1fr_auto] gap-10 items-center"
      >
        {/* Left Info */}
        <div className="order-2 md:order-1">
          <div style={{ marginBottom: "24px" }}>
            <div className="badge badge-red" style={{ marginBottom: "12px", display: "inline-flex" }}>
              {currentIndex + 1} of {candidates.length} profiles
            </div>
            <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(28px, 3vw, 40px)", fontWeight: 700, marginBottom: "8px" }}>
              FIND YOUR <span className="text-gradient">PARTNER</span>
            </h1>
            <p style={{ color: "var(--color-text-secondary)", fontSize: "14px" }}>
              Swipe right to match, left to skip
            </p>
          </div>

          {/* Next card preview */}
          {next && (
            <div className="glass-card hidden md:block" style={{ padding: "16px", opacity: 0.6 }}>
              <p style={{ fontSize: "12px", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>Up next</p>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ 
                  width: 36, height: 36, borderRadius: "50%", 
                  background: next.profileImage ? `url(${next.profileImage})` : "linear-gradient(135deg, #333, #555)", 
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  display: "flex", alignItems: "center", justifyContent: "center", color: "white" 
                }}>
                  {!next.profileImage && <User size={18} />}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "14px" }}>{next.name}</div>
                  <div style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>{next.gymLocation}</div>
                </div>
                <div style={{ marginLeft: "auto", fontSize: "13px", color: "var(--color-accent)", fontWeight: 700 }}>{next.compatibilityScore}%</div>
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: "12px" }} className="mt-0 md:mt-5">
            <button
              id="swipe-left-btn"
              onClick={() => handleSwipe(false)}
              className="btn-outline flex-1"
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "14px" }}
            >
              <ChevronLeft size={18} /> <span className="hidden md:inline">Skip</span>
            </button>
            <button
              id="swipe-right-btn"
              onClick={() => handleSwipe(true)}
              className="btn-primary flex-1 md:flex-[2]"
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "14px" }}
            >
              <Heart size={18} fill="white" /> <span className="hidden md:inline">Match</span>
            </button>
          </div>
        </div>

        {/* Card */}
        <div
          ref={cardRef}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          className={`${swiping === "left" ? "swipe-left" : swiping === "right" ? "swipe-right" : ""} order-1 md:order-2`}
          style={{
            width: "100%",
            height: "100%",
            maxWidth: "360px",
            cursor: "grab",
            userSelect: "none",
            transition: swiping ? "none" : "transform 0.3s ease",
            margin: "0 auto",
          }}
        >
          {/* Back card shadow */}
          {next && (
            <div className="glass-card" style={{ position: "absolute", inset: "10px -10px -10px 10px", opacity: 0.4, zIndex: -1 }} />
          )}

          <div
            className="glass-card"
            style={{
              padding: "0",
              overflow: "hidden",
              border: "1px solid var(--color-border-accent)",
              boxShadow: "0 24px 48px rgba(0,0,0,0.4)",
            }}
          >
            {/* Avatar Header */}
            <div style={{
              height: "200px",
              background: `linear-gradient(135deg, rgba(${current.compatibilityScore > 70 ? "230,57,70" : "40,40,60"}, 0.3), rgba(10,10,10,0.9))`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}>
              <div style={{
                width: 100,
                height: 100,
                borderRadius: "50%",
                background: current.profileImage ? `url(${current.profileImage})` : "linear-gradient(135deg, var(--color-accent), var(--color-accent-dark))",
                backgroundSize: "cover",
                backgroundPosition: "center",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                boxShadow: "0 0 32px rgba(230,57,70,0.4)",
              }}>
                {!current.profileImage && <User size={48} />}
              </div>

              {/* Compatibility badge */}
              <div style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                background: current.compatibilityScore >= 70 ? "rgba(230,57,70,0.9)" : "rgba(0,0,0,0.7)",
                backdropFilter: "blur(8px)",
                borderRadius: "8px",
                padding: "6px 12px",
                textAlign: "center",
                border: "1px solid rgba(255,255,255,0.1)",
              }}>
                <div style={{ fontFamily: "var(--font-heading)", fontSize: "20px", fontWeight: 700 }}>{current.compatibilityScore}%</div>
                <div style={{ fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(255,255,255,0.7)" }}>Match</div>
              </div>

              {/* Swipe hints */}
              {isDragging.current && currentX.current > 40 && (
                <div style={{ position: "absolute", top: "16px", left: "16px" }}>
                  <span style={{ background: "var(--color-accent)", color: "white", padding: "4px 12px", borderRadius: "4px", fontWeight: 700, fontSize: "14px", transform: "rotate(-15deg)", display: "block" }}>LIKE ❤️</span>
                </div>
              )}
            </div>

            {/* Card Body */}
            <div style={{ padding: "20px" }}>
              <div style={{ marginBottom: "14px" }}>
                <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "22px", fontWeight: 700, marginBottom: "4px" }}>{current.name}</h2>
                <div style={{ display: "flex", gap: "12px", fontSize: "13px", color: "var(--color-text-secondary)" }}>
                  {current.age && <span>{current.age} yrs</span>}
                  {current.course && <span>{current.course}</span>}
                  {current.year && <span>{current.year}</span>}
                </div>
              </div>

              {current.gymLocation && (
                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "var(--color-accent)", marginBottom: "14px" }}>
                  <MapPin size={13} /> {current.gymLocation}
                </div>
              )}

              {/* Stats grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginBottom: "14px" }}>
                {[
                  { icon: <Dumbbell size={12} />, label: "Split", value: current.questionnaire?.workoutSplit?.replace("Push Pull Legs", "PPL").replace("Upper / Lower", "U/L") || "—" },
                  { icon: <Clock size={12} />, label: "Time", value: current.questionnaire?.workoutTime?.split(" ")[0] || "—" },
                  { icon: <Target size={12} />, label: "Goal", value: current.fitnessGoal?.split(" ")[0] || "—" },
                ].map((stat) => (
                  <div key={stat.label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--color-border-subtle)", borderRadius: "8px", padding: "8px", textAlign: "center" }}>
                    <div style={{ color: "var(--color-accent)", marginBottom: "4px", display: "flex", justifyContent: "center" }}>{stat.icon}</div>
                    <div style={{ fontSize: "12px", fontWeight: 600 }}>{stat.value}</div>
                    <div style={{ fontSize: "10px", color: "var(--color-text-muted)", textTransform: "uppercase" }}>{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Tags */}
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "14px" }}>
                {current.fitnessLevel && (
                  <span className="badge badge-red">{current.fitnessLevel}</span>
                )}
                {current.questionnaire?.trainingStyle && (
                  <span style={{ padding: "3px 8px", background: "rgba(255,255,255,0.05)", border: "1px solid var(--color-border-subtle)", borderRadius: "100px", fontSize: "11px", color: "var(--color-text-secondary)" }}>
                    {current.questionnaire.trainingStyle}
                  </span>
                )}
                {current.questionnaire?.daysPerWeek && (
                  <span style={{ padding: "3px 8px", background: "rgba(255,255,255,0.05)", border: "1px solid var(--color-border-subtle)", borderRadius: "100px", fontSize: "11px", color: "var(--color-text-secondary)" }}>
                    {current.questionnaire.daysPerWeek}d/wk
                  </span>
                )}
              </div>

              {current.bio && (
                <p style={{ fontSize: "13px", color: "var(--color-text-secondary)", lineHeight: 1.6, borderTop: "1px solid var(--color-border-subtle)", paddingTop: "12px" }}>
                  &ldquo;{current.bio}&rdquo;
                </p>
              )}

              {/* Compatibility bar */}
              <div style={{ marginTop: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--color-text-muted)", marginBottom: "6px" }}>
                  <span>Compatibility</span>
                  <span style={{ color: "var(--color-accent)", fontWeight: 600 }}>{current.compatibilityScore}%</span>
                </div>
                <div style={{ height: "4px", background: "rgba(255,255,255,0.06)", borderRadius: "2px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${current.compatibilityScore}%`, background: "linear-gradient(90deg, var(--color-accent-dark), var(--color-accent))", borderRadius: "2px", transition: "width 0.8s ease" }} />
                </div>
              </div>
            </div>

            {/* Star indicator */}
            {current.compatibilityScore >= 80 && (
              <div style={{ padding: "10px 20px", background: "rgba(230,57,70,0.08)", borderTop: "1px solid rgba(230,57,70,0.15)", display: "flex", alignItems: "center", gap: "8px" }}>
                <Star size={13} fill="var(--color-accent)" color="var(--color-accent)" />
                <span style={{ fontSize: "12px", color: "var(--color-accent)", fontWeight: 600 }}>High compatibility match!</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>

  );
}
