"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { toast } from "react-hot-toast";
import { 
  LogOut, Trash2, Shield, Bell, ChevronRight, Camera, Save, 
  Dumbbell, Target, MapPin, Calendar, User as UserIcon, Clock, Users
} from "lucide-react";

const MENS_GYMS     = ["Fitty New (Mens)", "Fitty Old (Mens)", "Outdoor Gym (Mens)", "Indoor Gym (Mens)", "Trendset Gym (Mens)"];
const GIRLS_GYMS    = ["Girls Gym"];
const OUTSIDE_GYMS  = ["Infinity Fitness (Outside)", "Muscle Engineer (Outside)", "IMMC Fit Club (Outside)", "Stay Fit (Outside)", "AJ Fitness (Outside)"];
const GYM_LOCATIONS = [...MENS_GYMS, ...GIRLS_GYMS, ...OUTSIDE_GYMS];

const LEVELS        = ["Beginner", "Intermediate", "Advanced"];
const GOALS         = ["Muscle Gain", "Fat Loss", "Strength", "General Fitness", "Athletic Performance"];
const GENDERS       = ["Male", "Female", "Non-binary", "Prefer not to say"];
const COURSES       = ["B.Tech", "M.Tech", "MBA", "MCA", "BCA", "PhD"];
const YEARS         = ["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year"];
const WORKOUT_TIMES = ["Morning (6 AM - 9 AM)", "Afternoon (3 PM - 5 PM)", "Evening (5 PM - 8 PM)", "Full Time (Outside VIT)"];
const DURATIONS     = ["45 min", "1 hour", "1.5 hours", "2 hours", "2+ hours"];
const SPLITS        = ["Push Pull Legs", "Bro Split", "Upper / Lower", "Full Body", "Custom"];
const STYLES        = ["Heavy Lifting", "Hypertrophy", "Functional Training", "Cardio-Focused", "Mixed"];
const TRAITS        = ["Same Experience Level", "More Experienced Partner", "Same Timing", "Strict Routine", "High Intensity", "Motivating Partner"];

export default function SettingsPage() {
  const router = useRouter();
  const { user, logout, setUser } = useAuthStore();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    // Questionnaire fields
    workoutTime:     (user?.questionnaire as any)?.workoutTime || "",
    workoutDuration: (user?.questionnaire as any)?.workoutDuration || "",
    workoutSplit:    (user?.questionnaire as any)?.workoutSplit || "",
    trainingStyle:   (user?.questionnaire as any)?.trainingStyle || "",
    daysPerWeek:     (user?.questionnaire as any)?.daysPerWeek || 4,
    preferredPartnerTraits: (user?.questionnaire as any)?.preferredPartnerTraits || [] as string[],
    comfortableSpotting: (user?.questionnaire as any)?.comfortableSpotting || false,
    strictRoutine: (user?.questionnaire as any)?.strictRoutine || false,
    flexibleSchedule: (user?.questionnaire as any)?.flexibleSchedule || false,
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
        workoutTime:     (user.questionnaire as any)?.workoutTime || "",
        workoutDuration: (user.questionnaire as any)?.workoutDuration || "",
        workoutSplit:    (user.questionnaire as any)?.workoutSplit || "",
        trainingStyle:   (user.questionnaire as any)?.trainingStyle || "",
        daysPerWeek:     (user.questionnaire as any)?.daysPerWeek || 4,
        preferredPartnerTraits: (user.questionnaire as any)?.preferredPartnerTraits || [],
        comfortableSpotting: (user.questionnaire as any)?.comfortableSpotting || false,
        strictRoutine: (user.questionnaire as any)?.strictRoutine || false,
        flexibleSchedule: (user.questionnaire as any)?.flexibleSchedule || false,
      });
    }
  }, [user]);

  const toggleTrait = (t: string) => {
    setForm(prev => ({
      ...prev,
      preferredPartnerTraits: prev.preferredPartnerTraits.includes(t) 
        ? prev.preferredPartnerTraits.filter(x => x !== t) 
        : [...prev.preferredPartnerTraits, t]
    }));
  };

  const handleSaveProfile = async () => {
    setSaveLoading(true);
    try {
      const { 
        workoutTime, workoutDuration, workoutSplit, trainingStyle, 
        daysPerWeek, preferredPartnerTraits, comfortableSpotting, 
        strictRoutine, flexibleSchedule, ...profileData 
      } = form;

      const [profileRes, qRes] = await Promise.all([
        fetch("/api/user/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...profileData, age: profileData.age ? parseInt(profileData.age) : undefined }),
        }),
        fetch("/api/user/questionnaire", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            workoutTime, workoutDuration, workoutSplit, trainingStyle, 
            daysPerWeek, preferredPartnerTraits, comfortableSpotting, 
            strictRoutine, flexibleSchedule 
          }),
        })
      ]);

      if (!profileRes.ok || !qRes.ok) {
        toast.error("Failed to update profile");
        return;
      }

      const profileJson = await profileRes.json();
      const qJson = await qRes.json();

      if (profileRes.ok && qRes.ok) {
        setUser({ 
          ...user!, 
          ...profileJson.user, 
          questionnaire: qJson.questionnaire 
        });
        toast.success("Profile updated! ✅");
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to update profile");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    router.push("/login");
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/user/delete", { method: "DELETE" });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to delete account");
        return;
      }

      toast.success("Account deleted successfully. We'll miss you! 👋");
      logout();
      router.push("/login");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File too large (max 5MB)");
      return;
    }

    setImageLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/user/profile-image", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setUser({ ...user!, profileImage: data.imageUrl });
      toast.success("Profile photo updated! ✨");
    } catch (error: any) {
      toast.error(error.message || "Upload failed");
    } finally {
      setImageLoading(false);
    }
  };

  /* ── Sub-components ──────────────────────────────────────────────── */
  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div style={{ marginBottom: "16px" }}>
      <label
        style={{
          fontSize: "11px",
          fontWeight: 600,
          color: "var(--color-text-muted)",
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
        className="truncate"
        style={{
          padding: "8px 12px",
          background: active ? "rgba(230,57,70,0.15)" : "rgba(255,255,255,0.03)",
          border: `1.5px solid ${active ? "var(--color-accent)" : "var(--color-border-subtle)"}`,
          borderRadius: "8px",
          color: active ? "var(--color-accent)" : "var(--color-text-secondary)",
          fontSize: "12px",
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

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 24px" }}>
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "32px", fontWeight: 700, marginBottom: "8px" }}>
          <span className="text-gradient">SETTINGS</span>
        </h1>
        <p style={{ color: "var(--color-text-secondary)", fontSize: "14px" }}>Manage your profile and account</p>
      </div>

      <div className="flex flex-col md:grid md:grid-cols-[240px_1fr] gap-8">
        {/* Left Sidebar: Profile Preview + Quick Actions */}
        <div className="flex flex-col gap-6">
          <div className="glass-card text-center" style={{ padding: "24px" }}>
            <input 
              type="file" 
              ref={fileInputRef} 
              hidden 
              accept="image/*" 
              onChange={handleImageUpload} 
            />
            <div 
              className="relative inline-block mb-4 cursor-pointer group"
              onClick={() => fileInputRef.current?.click()}
            >
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  backgroundImage: user?.profileImage ? `url(${user.profileImage})` : "linear-gradient(135deg, var(--color-accent), var(--color-accent-dark))",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  margin: "0 auto",
                  boxShadow: "0 0 20px rgba(230,57,70,0.25)",
                  overflow: "hidden",
                  position: "relative"
                }}
              >
                {!user?.profileImage && <UserIcon size={40} />}
                {imageLoading && (
                  <div style={{
                    position: "absolute", inset: 0, 
                    background: "rgba(0,0,0,0.4)", display: "flex", 
                    alignItems: "center", justifyContent: "center"
                  }}>
                     <div className="spinner" style={{ width: 20, height: 20 }} />
                  </div>
                )}
              </div>
              <button
                style={{
                  position: "absolute", bottom: 0, right: 0,
                  width: 24, height: 24, borderRadius: "50%",
                  background: "var(--color-accent)", border: "2px solid var(--color-bg-primary)",
                  display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                  zIndex: 2
                }}
              >
                <Camera size={10} color="white" />
              </button>
            </div>
            <div style={{ fontWeight: 700, fontSize: "16px", marginBottom: "2px" }}>{user?.name}</div>
            <div style={{ fontSize: "12px", color: "var(--color-text-muted)", marginBottom: "16px" }}>{user?.email}</div>
            
            <div className="flex flex-col gap-2 text-left">
              {user?.gymLocation && (
                <div className="flex items-center gap-2" style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>
                  <MapPin size={12} color="var(--color-accent)" /> {user.gymLocation}
                </div>
              )}
              {user?.fitnessGoal && (
                <div className="flex items-center gap-2" style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>
                  <Target size={12} color="var(--color-accent)" /> {user.fitnessGoal}
                </div>
              )}
            </div>
          </div>

          <div className="glass-card overflow-hidden">
             <button
              onClick={handleLogout}
              style={{
                width: "100%", padding: "14px 16px", display: "flex", alignItems: "center", gap: "10px",
                background: "transparent", border: "none", color: "var(--color-text-primary)", cursor: "pointer", textAlign: "left"
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <LogOut size={16} color="var(--color-text-muted)" />
              <span style={{ fontSize: "14px", fontWeight: 500 }}>Sign Out</span>
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              style={{
                width: "100%", padding: "14px 16px", display: "flex", alignItems: "center", gap: "10px",
                background: "transparent", border: "none", borderTop: "1px solid var(--color-border-subtle)", 
                color: "var(--color-accent)", cursor: "pointer", textAlign: "left"
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(230,57,70,0.05)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <Trash2 size={16} />
              <span style={{ fontSize: "14px", fontWeight: 500 }}>Delete Account</span>
            </button>
          </div>
        </div>

        {/* Right Content: Profile Form */}
        <div className="flex flex-col gap-6">
          <div className="glass-card" style={{ padding: "24px" }}>
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "16px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Shield size={18} color="var(--color-accent)" /> EDIT PROFILE
            </h2>
            
            <div className="flex flex-col gap-4">
              <Field label="Full Name">
                <input
                  className="form-input"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Field label="Age">
                  <input
                    className="form-input" type="number"
                    value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })}
                  />
                </Field>
                <Field label="Course">
                  <select
                    className="form-input" value={form.course}
                    onChange={(e) => setForm({ ...form, course: e.target.value })}
                    style={{ backgroundColor: "#1a1a1a", color: "white" }}
                  >
                    <option value="">Select</option>
                    {COURSES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="Year">
                  <select
                    className="form-input" value={form.year}
                    onChange={(e) => setForm({ ...form, year: e.target.value })}
                    style={{ backgroundColor: "#1a1a1a", color: "white" }}
                  >
                    <option value="">Select</option>
                    {YEARS.map(y => <option key={y}>{y}</option>)}
                  </select>
                </Field>
              </div>

              <Field label="Gender">
                <div className="flex flex-wrap gap-2">
                  {GENDERS.map(g => (
                    <SelectChip key={g} value={g} current={form.gender} onClick={() => setForm({ ...form, gender: g })} />
                  ))}
                </div>
              </Field>

              <Field label="Bio">
                <textarea
                  className="form-input" rows={3}
                  value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  placeholder="Tell partners about yourself..."
                />
              </Field>
            </div>
          </div>

          <div className="glass-card" style={{ padding: "24px" }}>
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "16px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Dumbbell size={18} color="var(--color-accent)" /> FITNESS PREFERENCES
            </h2>
            
            <div className="flex flex-col gap-6">
              <Field label="Gym Location">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {(form.gender === "Male" 
                    ? [...MENS_GYMS, ...OUTSIDE_GYMS] 
                    : form.gender === "Female" 
                      ? [...GIRLS_GYMS, ...OUTSIDE_GYMS] 
                      : GYM_LOCATIONS
                  ).map(g => (
                    <SelectChip key={g} value={g} current={form.gymLocation} onClick={() => setForm({ ...form, gymLocation: g })} />
                  ))}
                </div>
              </Field>

              <Field label="Fitness Level">
                <div className="flex flex-wrap gap-2">
                  {LEVELS.map(l => (
                    <SelectChip key={l} value={l} current={form.fitnessLevel} onClick={() => setForm({ ...form, fitnessLevel: l })} />
                  ))}
                </div>
              </Field>

              <Field label="Fitness Goal">
                <div className="flex flex-wrap gap-2">
                  {GOALS.map(g => (
                    <SelectChip key={g} value={g} current={form.fitnessGoal} onClick={() => setForm({ ...form, fitnessGoal: g })} />
                  ))}
                </div>
              </Field>
            </div>
          </div>

          <div className="glass-card" style={{ padding: "24px" }}>
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "16px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Clock size={18} color="var(--color-accent)" /> WORKOUT PREFERENCES
            </h2>
            
            <div className="flex flex-col gap-6">
              <Field label="Workout Time">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {WORKOUT_TIMES.map(t => (
                    <SelectChip key={t} value={t} current={form.workoutTime} onClick={() => setForm({ ...form, workoutTime: t })} />
                  ))}
                </div>
              </Field>

              <Field label="Session Duration">
                <div className="flex flex-wrap gap-2">
                  {DURATIONS.map(d => (
                    <SelectChip key={d} value={d} current={form.workoutDuration} onClick={() => setForm({ ...form, workoutDuration: d })} />
                  ))}
                </div>
              </Field>

              <Field label="Workout Split">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {SPLITS.map(s => (
                    <SelectChip key={s} value={s} current={form.workoutSplit} onClick={() => setForm({ ...form, workoutSplit: s })} />
                  ))}
                </div>
              </Field>

              <Field label="Training Style">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {STYLES.map(s => (
                    <SelectChip key={s} value={s} current={form.trainingStyle} onClick={() => setForm({ ...form, trainingStyle: s })} />
                  ))}
                </div>
              </Field>

              <Field label={`Days per week: ${form.daysPerWeek}`}>
                <input 
                  type="range" min={1} max={7} 
                  value={form.daysPerWeek}
                  onChange={(e) => setForm({ ...form, daysPerWeek: parseInt(e.target.value) })}
                  style={{ width: "100%", accentColor: "var(--color-accent)" }} 
                />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "var(--color-text-muted)", marginTop: "4px" }}>
                  <span>1 day</span><span>7 days</span>
                </div>
              </Field>
            </div>
          </div>

          <div className="glass-card" style={{ padding: "24px" }}>
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "16px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Users size={18} color="var(--color-accent)" /> PARTNER PREFERENCES
            </h2>
            
            <div className="flex flex-col gap-6">
              <Field label="Preferred Partner Traits">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {TRAITS.map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => toggleTrait(t)}
                      style={{
                        padding: "8px 12px",
                        background: form.preferredPartnerTraits.includes(t) ? "rgba(230,57,70,0.15)" : "rgba(255,255,255,0.03)",
                        border: `1.5px solid ${form.preferredPartnerTraits.includes(t) ? "var(--color-accent)" : "var(--color-border-subtle)"}`,
                        borderRadius: "8px",
                        color: form.preferredPartnerTraits.includes(t) ? "var(--color-accent)" : "var(--color-text-secondary)",
                        fontSize: "12px",
                        fontWeight: form.preferredPartnerTraits.includes(t) ? 600 : 400,
                        cursor: "pointer",
                        transition: "all 0.15s",
                        textAlign: "left"
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="I'm comfortable with">
                <div className="flex flex-col gap-2">
                  {[
                    { key: "comfortableSpotting", label: "Spotting heavy lifts" },
                    { key: "strictRoutine", label: "Strict routine adherence" },
                    { key: "flexibleSchedule", label: "Flexible / changeable schedule" },
                  ].map(({ key, label }) => (
                    <label
                      key={key}
                      style={{ 
                        display: "flex", 
                        alignItems: "center", 
                        gap: "12px", 
                        cursor: "pointer", 
                        padding: "10px 14px", 
                        background: "rgba(255,255,255,0.02)", 
                        borderRadius: "8px", 
                        border: "1px solid var(--color-border-subtle)" 
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={(form as any)[key]}
                        onChange={(e) => setForm({ ...form, [key]: e.target.checked })}
                        style={{ accentColor: "var(--color-accent)", width: "16px", height: "16px" }}
                      />
                      <span style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>{label}</span>
                    </label>
                  ))}
                </div>
              </Field>
            </div>
          </div>

          <button
            className="btn-primary"
            onClick={handleSaveProfile}
            disabled={saveLoading}
            style={{ padding: "14px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
          >
            {saveLoading ? <div className="spinner" style={{ width: 16, height: 16 }} /> : <><Save size={16} /> Save Changes</>}
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 1000,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)",
        }}>
          <div className="glass-card" style={{ padding: "32px", maxWidth: "400px", width: "90%", border: "1px solid rgba(230,57,70,0.3)" }}>
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "22px", marginBottom: "12px", color: "var(--color-accent)" }}>DELETE ACCOUNT?</h2>
            <p style={{ color: "var(--color-text-secondary)", fontSize: "14px", marginBottom: "24px", lineHeight: 1.6 }}>
              This will permanently delete your profile, matches, and all chat history. This action cannot be undone.
            </p>
            <div style={{ display: "flex", gap: "12px" }}>
              <button className="btn-outline" onClick={() => setShowDeleteConfirm(false)} style={{ flex: 1 }} disabled={loading}>Cancel</button>
              <button
                style={{ flex: 1, background: loading ? "var(--color-text-muted)" : "var(--color-accent)", color: "white", border: "none", borderRadius: "6px", padding: "12px", fontFamily: "var(--font-heading)", fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                onClick={handleDeleteAccount}
                disabled={loading}
              >
                {loading ? <div className="spinner" style={{ width: "16px", height: "16px" }} /> : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
