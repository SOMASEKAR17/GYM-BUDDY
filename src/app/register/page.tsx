"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { Dumbbell, Eye, EyeOff } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

const COURSES = ["B.Tech", "M.Tech", "MBA", "MCA", "BCA", "PhD"];
const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year"];

import { auth } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";

export default function RegisterPage() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", password: "", course: "", year: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email.endsWith("@vitstudent.ac.in")) {
      toast.error("Please use your @vitstudent.ac.in email address");
      return;
    }
    setLoading(true);
    try {
      // 1. Create user in Firebase
      const firebaseRes = await createUserWithEmailAndPassword(auth, form.email, form.password);
      const idToken = await firebaseRes.user.getIdToken();

      // 2. Create user in local DB
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idToken,
          name: form.name,
          course: form.course,
          year: form.year,
        }),
      });

      const data = await res.json();
      if (!res.ok) { 
        toast.error(data.error || "Registration failed"); 
        // Cleanup Firebase user if backend fails (optional but good)
        await firebaseRes.user.delete();
        return; 
      }
      
      setUser(data.user);
      toast.success("Account created! Let's set up your profile 🏋️");
      router.push("/onboarding");
    } catch (error: any) {
      console.error(error);
      const msg = error.code === "auth/email-already-in-use" 
        ? "Email already in use" 
        : "Failed to create account";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-primary)", padding: "20px" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundImage: "linear-gradient(rgba(230,57,70,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(230,57,70,0.04) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
      <div className="glass-card fade-in" style={{ width: "100%", maxWidth: "440px", padding: "40px", position: "relative" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
              <div style={{ width: 36, height: 36, background: "var(--color-accent)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}><Dumbbell size={20} color="white" /></div>
              <span style={{ fontFamily: "var(--font-heading)", fontSize: "22px", fontWeight: 700, color: "white" }}>GYM<span style={{ color: "var(--color-accent)" }}>BUDDY</span></span>
            </div>
          </Link>
          <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "26px", fontWeight: 700, marginBottom: "8px" }}>JOIN GYMBUDDY</h1>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "14px" }}>VIT students only · @vitstudent.ac.in required</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "6px" }}>Full Name</label>
            <input id="reg-name" className="form-input" type="text" placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "6px" }}>VIT Email</label>
            <input id="reg-email" className="form-input" type="email" placeholder="yourname@vitstudent.ac.in" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "6px" }}>Course</label>
              <select id="reg-course" className="form-input" value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })} style={{ cursor: "pointer" }}>
                <option value="">Select</option>
                {COURSES.map((c) => <option className="font-black" key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "6px" }}>Year</label>
              <select id="reg-year" className="form-input" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} style={{ cursor: "pointer" }}>
                <option value="">Select</option>
                {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "6px" }}>Password</label>
            <div style={{ position: "relative" }}>
              <input id="reg-password" className="form-input" type={showPass ? "text" : "password"} placeholder="Min. 6 characters" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} style={{ paddingRight: "44px" }} />
              <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--color-text-muted)", cursor: "pointer" }}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button id="reg-submit" className="btn-primary" type="submit" disabled={loading} style={{ marginTop: "8px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
            {loading ? <><div className="spinner" /> Creating Account...</> : "Create Account →"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "20px", fontSize: "14px", color: "var(--color-text-secondary)" }}>
          Already have an account?{" "}
          <Link href="/login" style={{ color: "var(--color-accent)", fontWeight: 600, textDecoration: "none" }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
