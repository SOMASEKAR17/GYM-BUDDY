"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { Dumbbell, CheckCircle2 } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

const STEPS = ["Profile Info", "Workout Preferences", "Partner Traits"];

const MENS_GYMS     = ["Fitty New (Mens)", "Fitty Old (Mens)", "Outdoor Gym (Mens)", "Indoor Gym (Mens)", "Trendset Gym (Mens)"];
const GIRLS_GYMS    = ["Girls Gym"];
const OUTSIDE_GYMS  = ["Infinity Fitness (Outside)", "Muscle Engineer (Outside)", "IMMC Fit Club (Outside)", "Stay Fit (Outside)", "AJ Fitness (Outside)"];
const GYM_LOCATIONS = [...MENS_GYMS, ...GIRLS_GYMS, ...OUTSIDE_GYMS];

const WORKOUT_TIMES = ["Morning (6 AM - 9 AM)", "Afternoon (3 PM - 5 PM)", "Evening (5 PM - 8 PM)", "Full Time (Outside VIT)"];
const DURATIONS = ["45 min", "1 hour", "1.5 hours", "2 hours", "2+ hours"];
const SPLITS = ["Push Pull Legs", "Bro Split", "Upper / Lower", "Full Body", "Custom"];
const STYLES = ["Heavy Lifting", "Hypertrophy", "Functional Training", "Cardio-Focused", "Mixed"];
const LEVELS = ["Beginner", "Intermediate", "Advanced"];
const GOALS = ["Muscle Gain", "Fat Loss", "Strength", "General Fitness", "Athletic Performance"];
const TRAITS = ["Same Experience Level", "More Experienced Partner", "Same Timing", "Strict Routine", "High Intensity", "Motivating Partner"];
const GENDERS = ["Male", "Female", "Non-binary", "Prefer not to say"];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, setUser, isHydrated } = useAuthStore();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isHydrated && !user) {
      router.push("/login");
    }
  }, [user, isHydrated, router]);

  const [profile, setProfile] = useState({
    age: "", gender: "", bio: "", gymLocation: "", fitnessLevel: "", fitnessGoal: "",
  });
  const [questionnaire, setQuestionnaire] = useState({
    workoutTime: "", workoutDuration: "", workoutSplit: "", trainingStyle: "",
    experienceLevel: "", daysPerWeek: 4,
  });
  const [traits, setTraits] = useState<string[]>([]);
  const [comfort, setComfort] = useState({ comfortableSpotting: false, strictRoutine: false, flexibleSchedule: false });

  const toggleTrait = (t: string) => {
    setTraits((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]);
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      const [profileRes, qRes] = await Promise.all([
        fetch("/api/user/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...profile, age: profile.age ? parseInt(profile.age) : undefined }),
        }),
        fetch("/api/user/questionnaire", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...questionnaire, daysPerWeek: questionnaire.daysPerWeek, preferredPartnerTraits: traits, ...comfort }),
        }),
      ]);

      if (!profileRes.ok || !qRes.ok) {
        toast.error("Failed to save preferences"); return;
      }

      const profileData = await profileRes.json();
      setUser({ ...user!, ...profileData.user });
      toast.success("Profile set up! Let's find your partner 🔥");
      router.push("/discover");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const SelectCard = ({ value, selected, onClick, children }: { value: string; selected: boolean; onClick: () => void; children: React.ReactNode }) => (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "10px 14px",
        background: selected ? "rgba(230,57,70,0.15)" : "rgba(255,255,255,0.03)",
        border: `1.5px solid ${selected ? "var(--accent-red)" : "var(--border-subtle)"}`,
        borderRadius: "8px",
        color: selected ? "var(--accent-red)" : "var(--text-secondary)",
        fontSize: "13px",
        fontWeight: selected ? 600 : 400,
        cursor: "pointer",
        transition: "all 0.15s",
        textAlign: "left",
      }}
    >
      {children}
    </button>
  );

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ width: "100%", maxWidth: "600px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
            <div style={{ width: 36, height: 36, background: "var(--color-accent)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}><Dumbbell size={20} color="white" /></div>
            <span style={{ fontFamily: "var(--font-heading)", fontSize: "20px", fontWeight: 700 }}>GYM<span style={{ color: "var(--color-accent)" }}>BUDDY</span></span>
          </div>
          <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "28px", fontWeight: 700, marginBottom: "8px" }}>SET UP YOUR PROFILE</h1>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "14px" }}>Helps us find your perfect gym partner</p>
        </div>

        {/* Step indicator */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "32px" }}>
          {STEPS.map((s, i) => (
            <div key={s} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
              <div style={{
                width: "100%", height: "4px", borderRadius: "2px",
                background: i <= step ? "var(--color-accent)" : "var(--color-border-subtle)",
                transition: "background 0.3s",
              }} />
              <span style={{ fontSize: "11px", color: i === step ? "var(--color-accent)" : "var(--color-text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {s}
              </span>
            </div>
          ))}
        </div>

        <div className="glass-card fade-in" style={{ padding: "36px" }}>
          {/* STEP 0: Profile */}
          {step === 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "20px", marginBottom: "4px" }}>BASIC INFO</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ fontSize: "12px", color: "var(--color-text-secondary)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "6px" }}>Age</label>
                  <input className="form-input" type="number" min={16} max={40} placeholder="21" value={profile.age} onChange={(e) => setProfile({ ...profile, age: e.target.value })} />
                </div>
                <div>
                  <label style={{ fontSize: "12px", color: "var(--color-text-secondary)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "6px" }}>Gender</label>
                  <select className="form-input" value={profile.gender} onChange={(e) => setProfile({ ...profile, gender: e.target.value })} style={{ cursor: "pointer" }}>
                    <option value="">Select</option>
                    {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={{ fontSize: "12px", color: "var(--color-text-secondary)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "8px" }}>Gym Location</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "8px" }}>
                  {(profile.gender === "Male" 
                    ? [...MENS_GYMS, ...OUTSIDE_GYMS] 
                    : profile.gender === "Female" 
                      ? [...GIRLS_GYMS, ...OUTSIDE_GYMS] 
                      : GYM_LOCATIONS
                  ).map((g) => (
                    <SelectCard key={g} value={g} selected={profile.gymLocation === g} onClick={() => setProfile({ ...profile, gymLocation: g })}>{g}</SelectCard>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ fontSize: "12px", color: "var(--color-text-secondary)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "8px" }}>Fitness Level</label>
                <div style={{ display: "flex", gap: "8px" }}>
                  {LEVELS.map((l) => (
                    <SelectCard key={l} value={l} selected={profile.fitnessLevel === l} onClick={() => setProfile({ ...profile, fitnessLevel: l })}>{l}</SelectCard>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ fontSize: "12px", color: "var(--color-text-secondary)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "8px" }}>Fitness Goal</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "8px" }}>
                  {GOALS.map((g) => (
                    <SelectCard key={g} value={g} selected={profile.fitnessGoal === g} onClick={() => setProfile({ ...profile, fitnessGoal: g })}>{g}</SelectCard>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ fontSize: "12px", color: "var(--color-text-secondary)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "6px" }}>Bio</label>
                <textarea className="form-input" placeholder="Tell potential partners about yourself and your training style..." rows={3} value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} style={{ resize: "vertical" }} />
              </div>
            </div>
          )}

          {/* STEP 1: Workout Prefs */}
          {step === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "20px", marginBottom: "4px" }}>WORKOUT PREFERENCES</h2>
              <div>
                <label style={{ fontSize: "12px", color: "var(--color-text-secondary)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "8px" }}>Workout Time</label>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {WORKOUT_TIMES.map((t) => (
                    <SelectCard key={t} value={t} selected={questionnaire.workoutTime === t} onClick={() => setQuestionnaire({ ...questionnaire, workoutTime: t })}>{t}</SelectCard>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ fontSize: "12px", color: "var(--color-text-secondary)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "8px" }}>Session Duration</label>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {DURATIONS.map((d) => (
                    <SelectCard key={d} value={d} selected={questionnaire.workoutDuration === d} onClick={() => setQuestionnaire({ ...questionnaire, workoutDuration: d })}>{d}</SelectCard>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ fontSize: "12px", color: "var(--color-text-secondary)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "8px" }}>Workout Split</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "8px" }}>
                  {SPLITS.map((s) => (
                    <SelectCard key={s} value={s} selected={questionnaire.workoutSplit === s} onClick={() => setQuestionnaire({ ...questionnaire, workoutSplit: s })}>{s}</SelectCard>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ fontSize: "12px", color: "var(--color-text-secondary)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "8px" }}>Training Style</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "8px" }}>
                  {STYLES.map((s) => (
                    <SelectCard key={s} value={s} selected={questionnaire.trainingStyle === s} onClick={() => setQuestionnaire({ ...questionnaire, trainingStyle: s })}>{s}</SelectCard>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ fontSize: "12px", color: "var(--color-text-secondary)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "8px" }}>
                  Days per week: <span style={{ color: "var(--color-accent)" }}>{questionnaire.daysPerWeek}</span>
                </label>
                <input type="range" min={1} max={7} value={questionnaire.daysPerWeek}
                  onChange={(e) => setQuestionnaire({ ...questionnaire, daysPerWeek: parseInt(e.target.value) })}
                  style={{ width: "100%", accentColor: "var(--color-accent)" }} />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--color-text-muted)" }}>
                  <span>1 day</span><span>7 days</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Partner Traits */}
          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "20px", marginBottom: "4px" }}>PARTNER PREFERENCES</h2>
              <div>
                <label style={{ fontSize: "12px", color: "var(--color-text-secondary)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "8px" }}>
                  Preferred Traits (select all that apply)
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "8px" }}>
                  {TRAITS.map((t) => (
                    <SelectCard key={t} value={t} selected={traits.includes(t)} onClick={() => toggleTrait(t)}>{t}</SelectCard>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ fontSize: "12px", color: "var(--color-text-secondary)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "12px" }}>
                  I&apos;m comfortable with:
                </label>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {[
                    { key: "comfortableSpotting", label: "Spotting heavy lifts" },
                    { key: "strictRoutine", label: "Strict routine adherence" },
                    { key: "flexibleSchedule", label: "Flexible / changeable schedule" },
                  ].map(({ key, label }) => (
                    <label
                      key={key}
                      style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer", padding: "10px 14px", background: "rgba(255,255,255,0.02)", borderRadius: "8px", border: "1px solid var(--color-border-subtle)" }}
                    >
                      <input
                        type="checkbox"
                        checked={comfort[key as keyof typeof comfort]}
                        onChange={(e) => setComfort({ ...comfort, [key]: e.target.checked })}
                        style={{ accentColor: "var(--color-accent)", width: "16px", height: "16px" }}
                      />
                      <span style={{ fontSize: "14px", color: "var(--color-text-secondary)" }}>{label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="glass-card" style={{ padding: "16px", background: "rgba(230,57,70,0.05)", border: "1px solid rgba(230,57,70,0.2)" }}>
                <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                  <CheckCircle2 size={16} color="var(--color-accent)" style={{ flexShrink: 0, marginTop: "2px" }} />
                  <p style={{ fontSize: "13px", color: "var(--color-text-secondary)", lineHeight: 1.6 }}>
                    Your answers help our algorithm find the most compatible gym partners. You can always update these in Settings.
                  </p>
                </div>
              </div>
            </div>
          )}


          {/* Navigation */}
          <div style={{ display: "flex", gap: "12px", marginTop: "32px" }}>
            {step > 0 && (
              <button className="btn-outline" onClick={() => setStep(step - 1)} style={{ flex: 1 }}>
                ← Back
              </button>
            )}
            {step < STEPS.length - 1 ? (
              <button className="btn-primary" onClick={() => setStep(step + 1)} style={{ flex: 2, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                Continue →
              </button>
            ) : (
              <button className="btn-primary" onClick={handleFinish} disabled={loading} style={{ flex: 2, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                {loading ? <><div className="spinner" /> Saving...</> : "Find My Partners 🔥"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
