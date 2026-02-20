"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { Dumbbell, Eye, EyeOff } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

export default function LoginPage() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Sign in with Firebase
      const firebaseRes = await signInWithEmailAndPassword(auth, form.email, form.password);
      const idToken = await firebaseRes.user.getIdToken();

      // 2. Sign in with local backend
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      const data = await res.json();
      if (!res.ok) { 
        toast.error(data.error || "Login failed"); 
        return; 
      }
      setUser(data.user);
      toast.success("Welcome back! 💪");
      router.push(data.user.questionnaire ? "/discover" : "/onboarding");
    } catch (error: any) {
      console.error(error);
      const msg = (error.code === "auth/user-not-found" || error.code === "auth/wrong-password" || error.code === "auth/invalid-credential")
        ? "Invalid email or password"
        : "Failed to sign in";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--color-bg-primary)", padding: "20px" }}>
      <div
        style={{
          position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: "linear-gradient(rgba(230,57,70,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(230,57,71,0.04) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      <div className="glass-card fade-in" style={{ width: "100%", maxWidth: "420px", padding: "40px", position: "relative" }}>
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", marginBottom: "24px" }}>
              <div style={{ width: 36, height: 36, background: "var(--color-accent)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Dumbbell size={20} color="white" />
              </div>
              <span style={{ fontFamily: "var(--font-heading)", fontSize: "22px", fontWeight: 700, color: "white" }}>
                GYM<span style={{ color: "var(--color-accent)" }}>BUDDY</span>
              </span>
            </div>
          </Link>
          <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "28px", fontWeight: 700, marginBottom: "8px" }}>WELCOME BACK</h1>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "14px" }}>Sign in to find your gym partner</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "8px" }}>
              VIT Email
            </label>
            <input
              id="login-email"
              className="form-input"
              type="email"
              placeholder="yourname@vitstudent.ac.in"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div>
            <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "8px" }}>
              Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                id="login-password"
                className="form-input"
                type={showPass ? "text" : "password"}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                style={{ paddingRight: "44px" }}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--color-text-muted)", cursor: "pointer" }}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button id="login-submit" className="btn-primary" type="submit" disabled={loading} style={{ marginTop: "8px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
            {loading ? <><div className="spinner" /> Signing In...</> : "Sign In"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "24px", fontSize: "14px", color: "var(--color-text-secondary)" }}>
          No account?{" "}
          <Link href="/register" style={{ color: "var(--color-accent)", fontWeight: 600, textDecoration: "none" }}>
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
