"use client";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";
import { Camera, Save, Dumbbell, Target, MapPin, Calendar } from "lucide-react";

const GYM_LOCATIONS = ["Men's Gym 1", "Men's Gym 2", "Ladies Gym", "SAC Gym", "SJT Gym", "A-Block Gym"];
const LEVELS       = ["Beginner", "Intermediate", "Advanced"];
const GOALS        = ["Muscle Gain", "Fat Loss", "Strength", "General Fitness", "Athletic Performance"];
const GENDERS      = ["Male", "Female", "Non-binary", "Prefer not to say"];
const COURSES      = ["B.Tech", "M.Tech", "MBA", "MCA", "BCA", "PhD"];
const YEARS        = ["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year"];

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name:         user?.name         || "",
    age:          user?.age?.toString() || "",
    gender:       user?.gender       || "",
    bio:          user?.bio          || "",
    gymLocation:  user?.gymLocation  || "",
    fitnessLevel: user?.fitnessLevel || "",
    fitnessGoal:  user?.fitnessGoal  || "",
    course:       user?.course       || "",
    year:         user?.year         || "",
  });

  useEffect(() => {
    if (user) {
      setForm({
        name:         user.name         || "",
        age:          user.age?.toString() || "",
        gender:       user.gender       || "",
        bio:          user.bio          || "",
        gymLocation:  user.gymLocation  || "",
        fitnessLevel: user.fitnessLevel || "",
        fitnessGoal:  user.fitnessGoal  || "",
        course:       user.course       || "",
        year:         user.year         || "",
      });
    }
  }, [user]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, age: form.age ? parseInt(form.age) : undefined }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }
      setUser({ ...user!, ...data.user });
      toast.success("Profile updated! ✅");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  /* ── Sub-components ──────────────────────────────────────────────── */
  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div>
      <label
        style={{
          fontSize: "12px",
          fontWeight: 600,
          color: "var(--color-text-secondary)",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          display: "block",
          marginBottom: "6px",
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );

  const SelectChip = ({
    value, current, onClick,
  }: { value: string; current: string; onClick: () => void }) => {
    const active = current === value;
    return (
      <button
        type="button"
        onClick={onClick}
        style={{
          padding: "8px 14px",
          background: active ? "rgba(230,57,70,0.15)" : "rgba(255,255,255,0.03)",
          border: `1.5px solid ${active ? "var(--color-accent)" : "var(--color-border-subtle)"}`,
          borderRadius: "8px",
          color: active ? "var(--color-accent)" : "var(--color-text-secondary)",
          fontSize: "13px",
          fontWeight: active ? 600 : 400,
          cursor: "pointer",
          transition: "all 0.15s",
          whiteSpace: "nowrap",
        }}
      >
        {value}
      </button>
    );
  };

  const avatarLetter = user?.name?.charAt(0).toUpperCase() || "U";

  return (
    <div className="max-w-[860px] mx-auto px-4 md:px-8 py-8 md:py-10">

      {/* ── Header ── */}
      <div className="mb-8">
        <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(26px,4vw,36px)", fontWeight: 700, marginBottom: "6px" }}>
          YOUR <span className="text-gradient">PROFILE</span>
        </h1>
        <p style={{ color: "var(--color-text-secondary)", fontSize: "14px" }}>
          Manage how you appear to potential partners
        </p>
      </div>

      {/* ── Page grid: stacked on mobile, side-by-side on md+ ── */}
      <div className="flex flex-col md:flex-row gap-6 items-start">

        {/* ── Avatar sidebar ── */}
        <div
          className="glass-card w-full md:w-[200px] shrink-0 text-center"
          style={{ padding: "24px" }}
        >
          {/* Avatar */}
          <div className="relative inline-block mb-4">
            <div
              style={{
                width: 100,
                height: 100,
                borderRadius: "50%",
                background: "linear-gradient(135deg, var(--color-accent), var(--color-accent-dark))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "var(--font-heading)",
                fontSize: "40px",
                fontWeight: 700,
                color: "white",
                margin: "0 auto",
                boxShadow: "0 0 24px rgba(230,57,70,0.3)",
              }}
            >
              {avatarLetter}
            </div>
            <button
              title="Change photo"
              style={{
                position: "absolute",
                bottom: 0,
                right: 0,
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: "var(--color-accent)",
                border: "2px solid var(--color-bg-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <Camera size={12} color="white" />
            </button>
          </div>

          {/* Name + email */}
          <div style={{ fontFamily: "var(--font-heading)", fontSize: "15px", fontWeight: 700, marginBottom: "2px" }}>
            {user?.name}
          </div>
          <div style={{ fontSize: "11px", color: "var(--color-text-muted)", marginBottom: "16px", wordBreak: "break-all" }}>
            {user?.email}
          </div>

          {/* Quick stats */}
          <div className="flex flex-col gap-2 text-left">
            {user?.gymLocation && (
              <div className="flex items-center gap-2" style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>
                <MapPin size={12} color="var(--color-accent)" style={{ shrink: 0 }} />
                {user.gymLocation}
              </div>
            )}
            {user?.fitnessLevel && (
              <div className="flex items-center gap-2" style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>
                <Dumbbell size={12} color="var(--color-accent)" />
                {user.fitnessLevel}
              </div>
            )}
            {user?.fitnessGoal && (
              <div className="flex items-center gap-2" style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>
                <Target size={12} color="var(--color-accent)" />
                {user.fitnessGoal}
              </div>
            )}
            {user?.year && (
              <div className="flex items-center gap-2" style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>
                <Calendar size={12} color="var(--color-accent)" />
                {user.year}
              </div>
            )}
          </div>
        </div>

        {/* ── Form column ── */}
        <div className="flex-1 flex flex-col gap-4 w-full">

          {/* Personal Info card */}
          <div className="glass-card" style={{ padding: "24px" }}>
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "15px", marginBottom: "20px" }}>
              PERSONAL INFO
            </h2>
            <div className="flex flex-col gap-4">

              <Field label="Full Name">
                <input
                  id="profile-name"
                  className="form-input"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </Field>

              {/* Age / Course / Year — 1 col → 3 col */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Field label="Age">
                  <input
                    className="form-input"
                    type="number"
                    min={16}
                    max={40}
                    value={form.age}
                    onChange={(e) => setForm({ ...form, age: e.target.value })}
                  />
                </Field>
                <Field label="Course">
                  <select
                    className="form-input"
                    value={form.course}
                    onChange={(e) => setForm({ ...form, course: e.target.value })}
                    style={{ cursor: "pointer", backgroundColor: "#1a1a1a", color: "white" }}
                  >
                    <option value="">Select</option>
                    {COURSES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="Year">
                  <select
                    className="form-input"
                    value={form.year}
                    onChange={(e) => setForm({ ...form, year: e.target.value })}
                    style={{ cursor: "pointer", backgroundColor: "#1a1a1a", color: "white" }}
                  >
                    <option value="">Select</option>
                    {YEARS.map((y) => <option key={y}>{y}</option>)}
                  </select>
                </Field>
              </div>

              <Field label="Gender">
                <div className="flex flex-wrap gap-2">
                  {GENDERS.map((g) => (
                    <SelectChip key={g} value={g} current={form.gender} onClick={() => setForm({ ...form, gender: g })} />
                  ))}
                </div>
              </Field>

              <Field label="Bio">
                <textarea
                  className="form-input"
                  rows={3}
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  placeholder="Tell partners about your training style..."
                  style={{ resize: "vertical" }}
                />
              </Field>
            </div>
          </div>

          {/* Fitness Preferences card */}
          <div className="glass-card" style={{ padding: "24px" }}>
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "15px", marginBottom: "20px" }}>
              FITNESS PREFERENCES
            </h2>
            <div className="flex flex-col gap-5">

              <Field label="Gym Location">
                {/* 2-col on mobile, 3-col on sm+ */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {GYM_LOCATIONS.map((g) => (
                    <SelectChip key={g} value={g} current={form.gymLocation} onClick={() => setForm({ ...form, gymLocation: g })} />
                  ))}
                </div>
              </Field>

              <Field label="Fitness Level">
                <div className="flex flex-wrap gap-2">
                  {LEVELS.map((l) => (
                    <SelectChip key={l} value={l} current={form.fitnessLevel} onClick={() => setForm({ ...form, fitnessLevel: l })} />
                  ))}
                </div>
              </Field>

              <Field label="Fitness Goal">
                <div className="flex flex-wrap gap-2">
                  {GOALS.map((g) => (
                    <SelectChip key={g} value={g} current={form.fitnessGoal} onClick={() => setForm({ ...form, fitnessGoal: g })} />
                  ))}
                </div>
              </Field>
            </div>
          </div>

          {/* Save button */}
          <button
            id="save-profile-btn"
            className="btn-primary"
            onClick={handleSave}
            disabled={loading}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              padding: "14px",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading
              ? <><div className="spinner" style={{ width: 16, height: 16 }} /> Saving…</>
              : <><Save size={16} /> Save Profile</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}
