"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { toast } from "react-hot-toast";
import { LogOut, Trash2, Shield, Bell, ChevronRight } from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    router.push("/");
  };

  const settingSections = [
    {
      title: "Account",
      items: [
        { icon: <Shield size={16} />, label: "Privacy & Security", desc: "Manage your account security settings", action: () => toast("Coming soon") },
        { icon: <Bell size={16} />, label: "Notifications", desc: "Configure in-app and email notifications", action: () => toast("Coming soon") },
      ],
    },
  ];

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
      router.push("/");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "700px", margin: "0 auto", padding: "40px 24px" }}>
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "32px", fontWeight: 700, marginBottom: "8px" }}>
          <span className="text-gradient">SETTINGS</span>
        </h1>
        <p style={{ color: "var(--color-text-secondary)", fontSize: "14px" }}>Manage your GymBuddy account</p>
      </div>

      {/* Profile summary */}
      <div className="glass-card flex flex-col md:flex-row" style={{ padding: "20px", marginBottom: "24px", display: "flex", alignItems: "center", gap: "16px" }}>
        <div style={{ width: 52, height: 52, borderRadius: "50%", background: "linear-gradient(135deg, var(--color-accent), var(--color-accent-dark))", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-heading)", fontSize: "22px", fontWeight: 700 }}>
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: "16px" }}>{user?.name}</div>
          <div style={{ fontSize: "13px", color: "var(--color-text-muted)" }}>{user?.email}</div>
        </div>
        <button
          className="btn-outline"
          onClick={() => router.push("/profile")}
          style={{ padding: "8px 16px", fontSize: "12px", display: "flex", alignItems: "center", gap: "6px" }}
        >
          Edit Profile <ChevronRight size={14} />
        </button>
      </div>

      {settingSections.map((section) => (
        <div key={section.title} style={{ marginBottom: "24px" }}>
          <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "14px", color: "var(--color-text-muted)", marginBottom: "12px", letterSpacing: "0.08em" }}>
            {section.title.toUpperCase()}
          </h2>
          <div className="glass-card" style={{ overflow: "hidden" }}>
            {section.items.map((item, i) => (
              <button
                key={item.label}
                onClick={item.action}
                style={{
                  width: "100%",
                  padding: "16px 20px",
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  background: "transparent",
                  border: "none",
                  borderTop: i > 0 ? "1px solid var(--color-border-subtle)" : "none",
                  color: "var(--color-text-primary)",
                  cursor: "pointer",
                  transition: "background 0.15s",
                  textAlign: "left",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <div style={{ width: 36, height: 36, borderRadius: "8px", background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-accent)", flexShrink: 0 }}>
                  {item.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "14px", fontWeight: 500 }}>{item.label}</div>
                  <div style={{ fontSize: "12px", color: "var(--color-text-muted)", marginTop: "2px" }}>{item.desc}</div>
                </div>
                <ChevronRight size={16} color="var(--color-text-muted)" />
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Danger Zone */}
      <div>
        <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "14px", color: "var(--color-text-muted)", marginBottom: "12px", letterSpacing: "0.08em" }}>
          ACCOUNT ACTIONS
        </h2>
        <div className="glass-card" style={{ overflow: "hidden" }}>
          <button
            id="logout-settings-btn"
            onClick={handleLogout}
            style={{
              width: "100%",
              padding: "16px 20px",
              display: "flex",
              alignItems: "center",
              gap: "14px",
              background: "transparent",
              border: "none",
              color: "var(--color-text-primary)",
              cursor: "pointer",
              transition: "background 0.15s",
              textAlign: "left",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <div style={{ width: 36, height: 36, borderRadius: "8px", background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-text-secondary)", flexShrink: 0 }}>
              <LogOut size={16} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "14px", fontWeight: 500 }}>Sign Out</div>
              <div style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>Log out of your GymBuddy account</div>
            </div>
          </button>

          <button
            id="delete-account-btn"
            onClick={() => setShowDeleteConfirm(true)}
            style={{
              width: "100%",
              padding: "16px 20px",
              display: "flex",
              alignItems: "center",
              gap: "14px",
              background: "transparent",
              border: "none",
              borderTop: "1px solid var(--color-border-subtle)",
              color: "var(--color-accent)",
              cursor: "pointer",
              transition: "background 0.15s",
              textAlign: "left",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(230,57,70,0.05)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <div style={{ width: 36, height: 36, borderRadius: "8px", background: "rgba(230,57,70,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Trash2 size={16} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "14px", fontWeight: 500 }}>Delete Account</div>
              <div style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>Permanently delete your account and data</div>
            </div>
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
