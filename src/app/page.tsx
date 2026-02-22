"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Dumbbell, Users, Zap, Shield, ChevronRight, Activity, Menu, X as CloseIcon, Trophy, MessageSquare, Search } from "lucide-react";

const stats = [
  { value: "1,200+", label: "Students Matched" },
  { value: "8",      label: "Gym Locations" },
  { value: "94%",    label: "Match Satisfaction" },
  { value: "320+",   label: "Active Pairs" },
];

const features = [
  {
    icon: <Users size={24} />,
    title: "Gym Groups",
    desc: "Form or join exclusive gym groups. Stay accountable with your squad and push each other to new heights.",
  },
  {
    icon: <Trophy size={24} />,
    title: "Group Leaderboards",
    desc: "Track your group's performance against the entire VIT community. See who the real powerhouses are.",
  },
  {
    icon: <Activity size={24} />,
    title: "Verified PRs",
    desc: "Submit your Personal Records for group endorsement. Build a legacy of strength within your circle.",
  },
  {
    icon: <Search size={24} />,
    title: "Smart Matching",
    desc: "Our algorithm matches you based on gym, timing, workout split, goals, and experience level.",
  },
  {
    icon: <Dumbbell size={24} />,
    title: "Swipe to Connect",
    desc: "Browse through profiles of VIT students with matching fitness habits. Right means interest.",
  },
  {
    icon: <MessageSquare size={24} />,
    title: "Real-Time Chat",
    desc: "Message your gym partner instantly once you both match. Coordinate sessions on the go.",
  },
  {
    icon: <Shield size={24} />,
    title: "VIT Exclusive",
    desc: "Only verified @vit.ac.in email addresses can join. Your community, your safety.",
  },
];

const splits = ["Push Pull Legs", "Bro Split", "Upper / Lower", "Full Body"];

export default function LandingPage() {
  const [activeSplit, setActiveSplit] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSplit((prev) => (prev + 1) % splits.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main style={{ minHeight: "100vh" }}>

      {/* ── NAV ─────────────────────────────────────────────────────────── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between h-16 px-5 md:px-10"
        style={{
          background: "rgba(13,13,13,0.85)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid var(--color-border-subtle)",
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div
            className="flex items-center justify-center rounded-lg shrink-0"
            style={{ width: 32, height: 32, background: "var(--color-accent)" }}
          >
            <Dumbbell size={18} color="white" />
          </div>
          <span
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "20px",
              fontWeight: 700,
              letterSpacing: "0.05em",
              color: "white",
            }}
          >
            GYM<span style={{ color: "var(--color-accent)" }}>BUDDY</span>
          </span>
        </div>

        {/* Desktop Nav buttons */}
        <div className="hidden md:flex items-center gap-2 md:gap-3">
          <Link href="/login">
            <button className="btn-outline" style={{ padding: "8px 16px", fontSize: "13px" }}>
              Login
            </button>
          </Link>
          <Link href="/register">
            <button className="btn-primary" style={{ padding: "8px 16px", fontSize: "13px" }}>
              <span>Get Started</span>
            </button>
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button
          className="flex md:hidden p-2 text-white"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          style={{
            background: isMenuOpen ? "rgba(230,57,71,0.2)" : "rgba(255,255,255,0.05)",
            border: `1px solid ${isMenuOpen ? "var(--color-accent)" : "rgba(255,255,255,0.1)"}`,
            borderRadius: "8px",
            alignItems: "center",
            justifyContent: "center",
            width: "40px",
            height: "40px",
            transition: "all 0.2s",
          }}
        >
          {isMenuOpen ? <CloseIcon size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-[rgba(13,13,13,0.98)] backdrop-blur-xl md:hidden fade-in"
          style={{ paddingTop: "80px", paddingLeft: "24px", paddingRight: "24px" }}
        >
          <div className="flex flex-col gap-4 p-6">
            <h3 style={{ fontFamily: "var(--font-heading)", color: "var(--color-text-muted)", fontSize: "14px", letterSpacing: "0.1em" }}>WELCOME TO GYMBUDDY</h3>
            <Link href="/login" className="w-full">
              <button
                className="btn-outline w-full"
                style={{ padding: "16px", fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}
              >
                Sign In to Account
              </button>
            </Link>
            <Link href="/register" className="w-full">
              <button
                className="btn-primary w-full"
                style={{ padding: "16px", fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}
              >
                Get Started Now <ChevronRight size={18} />
              </button>
            </Link>

            <div className="mt-8 pt-8 border-t border-[var(--color-border-subtle)]">
              <p className="text-sm text-[var(--color-text-secondary)] mb-6">Find your perfect training partner from over 1,200+ VIT students.</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="glass-card p-4 text-center">
                  <div className="text-xl font-bold text-[var(--color-accent)]">1,200+</div>
                  <div className="text-[10px] uppercase text-[var(--color-text-muted)]">Users</div>
                </div>
                <div className="glass-card p-4 text-center">
                  <div className="text-xl font-bold text-[var(--color-accent)]">94%</div>
                  <div className="text-[10px] uppercase text-[var(--color-text-muted)]">Success</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <section
        className="relative flex items-center overflow-hidden"
        style={{ minHeight: "100vh", paddingTop: "64px" }}
      >
        {/* Background grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(230,57,71,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(230,57,71,0.03) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        {/* Radial glow */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: "20%",
            right: "-10%",
            width: "600px",
            height: "600px",
            background: "radial-gradient(circle, rgba(230, 57, 71, 0.15) 0%, transparent 70%)",
          }}
        />

        {/* Hero inner grid: 1-col mobile → 2-col desktop */}
        <div className="relative w-full max-w-[1200px] mx-auto px-5 md:px-10 py-16 md:py-20 grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">

          {/* ── LEFT: copy ── */}
          <div className="slide-up">
            <div
              className="badge badge-red mb-6 inline-flex gap-1.5"
            >
              <Activity size={11} /> VIT Vellore • Exclusive Platform
            </div>

            <h1
              style={{
                fontSize: "clamp(40px, 7vw, 80px)",
                fontFamily: "var(--font-heading)",
                fontWeight: 700,
                lineHeight: 1.05,
                marginBottom: "20px",
                letterSpacing: "0.02em",
              }}
            >
              DOMINATE THE{" "}
              <span className="text-gradient" style={{ display: "block" }}>
                LEADERBOARD
              </span>
              WITH YOUR SQUAD
            </h1>

            <p
              className="text-sm md:text-base mb-8 md:mb-10"
              style={{
                color: "var(--color-text-secondary)",
                lineHeight: 1.7,
                maxWidth: "440px",
              }}
            >
              The ultimate VIT fitness social platform. Join exclusive <span style={{ color: "white" }}>Gym Groups</span>, track your <span style={{ color: "white" }}>Personal Records</span>, and climb the rankings together.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link href="/register">
                <button className="btn-primary" style={{ padding: "13px 30px", fontSize: "15px" }}>
                  Start Matching <ChevronRight size={16} style={{ display: "inline" }} />
                </button>
              </Link>
              <Link href="/login">
                <button className="btn-outline" style={{ padding: "13px 30px", fontSize: "15px" }}>
                  Sign In
                </button>
              </Link>
            </div>

            {/* Split ticker */}
            <div className="mt-10 flex items-center gap-3">
              <span
                style={{
                  fontSize: "12px",
                  color: "var(--color-text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                Active split:
              </span>
              <span key={activeSplit} className="badge badge-red fade-in">
                {splits[activeSplit]}
              </span>
            </div>
          </div>

          {/* ── RIGHT: card stack — hidden on mobile ── */}
          <div className="hidden md:block relative" style={{ height: "480px" }}>
            {/* Back card */}
            <div
              className="glass-card absolute"
              style={{
                top: "30px", left: "30px", right: "-30px", bottom: 0,
                height: "400px",
                transform: "rotate(0deg)",
                border: "1px solid var(--color-border-accent)",
                opacity: 0.5,
              }}
            />
            {/* Middle card */}
            <div
              className="glass-card absolute"
              style={{
                top: "15px", left: "15px", right: "-15px", bottom: "-15px",
                height: "440px",
                transform: "rotate(0deg)",
                border: "1px solid var(--color-border-accent)",
                opacity: 0.7,
              }}
            />
            {/* Main card */}
            <div
              className="glass-card absolute inset-0 flex flex-col"
              style={{
                padding: "28px",
                border: "1px solid var(--color-border-accent)",
              }}
            >
              {/* Profile Header */}
              <div className="flex items-center gap-4 mb-5">
                <div
                  className="flex items-center justify-center shrink-0 rounded-full"
                  style={{
                    width: 64, height: 64,
                    background: "linear-gradient(135deg, #E63946, #C1121F)",
                    fontSize: "24px", fontWeight: 700,
                    fontFamily: "var(--font-heading)",
                    color: "white",
                  }}
                >
                  R
                </div>
                <div>
                  <div style={{ fontFamily: "var(--font-heading)", fontSize: "20px", fontWeight: 700 }}>
                    VIT ELITES
                  </div>
                  <div style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>
                    B.Tech CSE • 3rd Year
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--color-accent)", marginTop: "2px" }}>
                    📍 Men&apos;s Gym 1
                  </div>
                </div>
                <div
                  className="ml-auto rounded-lg text-center"
                  style={{
                    background: "rgba(255, 215, 0, 0.1)",
                    border: "1px solid rgba(255, 215, 0, 0.3)",
                    padding: "6px 12px",
                  }}
                >
                  <div style={{ fontSize: "18px", fontWeight: 700, color: "#FFD700", fontFamily: "var(--font-heading)" }}>
                    RANK #1
                  </div>
                  <div style={{ fontSize: "10px", color: "var(--color-text-muted)", textTransform: "uppercase" }}>
                    Leaderboard
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2.5 mb-5">
                {[
                  { label: "Members",  value: "8/10" },
                  { label: "Total PRs", value: "142" },
                  { label: "Points",   value: "1420" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-lg text-center"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      padding: "10px",
                      border: "1px solid var(--color-border-subtle)",
                    }}
                  >
                    <div style={{ fontSize: "13px", fontWeight: 600, color: "white" }}>{item.value}</div>
                    <div style={{ fontSize: "10px", color: "var(--color-text-muted)", textTransform: "uppercase", marginTop: "2px" }}>
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>

              <p style={{ fontSize: "13px", color: "var(--color-text-secondary)", lineHeight: 1.6, flexGrow: 1 }}>
                &quot;The elite squad of powerlifters from VIT. We hit the Main Gym every morning at 6 AM. No ego, just heavy reps and verified progress.&quot;
              </p>

              {/* Swipe buttons */}
              <div className="flex gap-3 mt-6">
                <button className="btn-primary" style={{ flex: 1, fontSize: "15px" }}>
                  Join the Squad
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ───────────────────────────────────────────────────────── */}
      <section style={{ borderTop: "1px solid var(--color-border-subtle)", borderBottom: "1px solid var(--color-border-subtle)" }}>
        <div className="max-w-[1200px] mx-auto px-5 md:px-10 py-10 md:py-12 grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div
                style={{
                  fontSize: "clamp(28px, 4vw, 48px)",
                  fontFamily: "var(--font-heading)",
                  fontWeight: 700,
                  color: "var(--color-accent)",
                }}
              >
                {stat.value}
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "var(--color-text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  marginTop: "4px",
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────────────────── */}
      <section className="max-w-[1200px] mx-auto px-5 md:px-10 py-16 md:py-24">
        <div className="text-center mb-12 md:mb-16">
          <div className="badge badge-red mb-4 inline-flex">How It Works</div>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 52px)", fontFamily: "var(--font-heading)", fontWeight: 700 }}>
            TRAIN SMARTER,{" "}
            <span className="text-gradient">TOGETHER</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="glass-card"
              style={{
                padding: "28px 24px",
                transition: "border-color 0.2s, transform 0.2s",
                cursor: "default",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(230,57,71,0.4)";
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = "var(--color-border-subtle)";
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
              }}
            >
              <div
                className="flex items-center justify-center rounded-xl mb-5"
                style={{
                  width: 48, height: 48,
                  background: "rgba(230,57,71,0.1)",
                  border: "1px solid rgba(230,57,71,0.2)",
                  color: "var(--color-accent)",
                }}
              >
                {f.icon}
              </div>
              <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "18px", marginBottom: "10px" }}>
                {f.title}
              </h3>
              <p style={{ fontSize: "14px", color: "var(--color-text-secondary)", lineHeight: 1.7 }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────── */}
      <section
        style={{
          background: "linear-gradient(135deg, rgba(230, 57, 71, 0.29) 0%, transparent 100%)",
          borderTop: "1px solid var(--color-border-subtle)",
          borderBottom: "1px solid var(--color-border-subtle)",
        }}
      >
        <div className="max-w-[800px] mx-auto px-5 md:px-10 py-16 md:py-24 text-center">
          <h2
            style={{
              fontSize: "clamp(30px, 5vw, 60px)",
              fontFamily: "var(--font-heading)",
              fontWeight: 700,
              marginBottom: "16px",
            }}
          >
            READY TO FIND YOUR{" "}
            <span className="text-gradient">PARTNER?</span>
          </h2>
          <p
            className="mb-8 md:mb-10"
            style={{ fontSize: "15px", color: "var(--color-text-secondary)", lineHeight: 1.7 }}
          >
            Join 1,200+ VIT students already using GymBuddy. Create your profile in 2 minutes.
          </p>
          <Link href="/register">
            <button
              className="btn-primary pulse-red"
              style={{ padding: "14px 40px", fontSize: "15px" }}
            >
              Join GymBuddy — It&apos;s Free
            </button>
          </Link>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer
        className="px-5 md:px-10 py-8 text-center"
        style={{
          borderTop: "1px solid var(--color-border-subtle)",
          color: "var(--color-text-muted)",
          fontSize: "13px",
        }}
      >
        <span style={{ color: "var(--color-accent)", fontFamily: "var(--font-heading)" }}>GYMBUDDY</span>
        {" "}— Made for VIT Students · {new Date().getFullYear()}
      </footer>
    </main>
  );
}
