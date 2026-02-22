"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Dumbbell, Search, MessageSquare, User, Settings, Bell, LogOut, RotateCcw, Menu, X as CloseIcon, Users, Trophy } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useNotificationStore } from "@/store/notificationStore";
import { useState, useEffect, useRef } from "react";
import { toast } from "react-hot-toast";

const NAV_ITEMS = [
  { href: "/discover", icon: <Search size={18} />, label: "Discover" },
  { href: "/matches",  icon: <MessageSquare size={18} />, label: "Matches" },
  { href: "/skipped",  icon: <RotateCcw size={18} />, label: "Skipped" },
  { href: "/groups",   icon: <Users size={18} />, label: "Groups" },
  { href: "/settings", icon: <Settings size={18} />, label: "Settings" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { unreadCount, setNotifications, markAsRead, markAllAsRead, notifications } = useNotificationStore();
  const [showNotif, setShowNotif] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userGroup, setUserGroup] = useState<any>(null);

  const notifRefDesktop = useRef<HTMLDivElement>(null);
  const notifRefMobile = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const isOutsideDesktop = notifRefDesktop.current && !notifRefDesktop.current.contains(event.target as Node);
      const isOutsideMobile = notifRefMobile.current && !notifRefMobile.current.contains(event.target as Node);
      
      if (isOutsideDesktop && isOutsideMobile) {
        setShowNotif(false);
      }
    };

    if (showNotif) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showNotif]);

  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((d) => { if (d.notifications) setNotifications(d.notifications); })
      .catch(() => {});
    
    // Check group status
    fetch("/api/groups/my-group")
      .then(r => r.json())
      .then(d => setUserGroup(d.group))
      .catch(() => {});
  }, [setNotifications]);

  const navItems = [...NAV_ITEMS];
  if (userGroup) {
    // Insert Group Dashboard before Settings
    const settingsIdx = navItems.findIndex(i => i.href === "/settings");
    navItems.splice(settingsIdx, 0, { 
      href: "/groups/dashboard", 
      icon: <Trophy size={18} />, 
      label: "Group CRM" 
    });
  }

  const refreshNotifications = async () => {
    try {
      const r = await fetch("/api/notifications");
      const d = await r.json();
      if (d.notifications) setNotifications(d.notifications);
      toast.success("Notifications updated", { id: "notif-refresh" });
    } catch {
      toast.error("Failed to refresh");
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  // Close menu when navigating
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  return (
    <>
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          background: "rgba(13,13,13,0.92)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid var(--color-border-subtle)",
          height: "64px",
          display: "flex",
          alignItems: "center",
          padding: "0 20px md:0 24px",
          justifyContent: "space-between",
        }}
        className="px-5 md:px-10"
      >
        {/* Logo */}
        <Link href="/discover" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: 32, height: 32, background: "var(--color-accent)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Dumbbell size={18} color="white" />
          </div>
          <span style={{ fontFamily: "var(--font-heading)", fontSize: "18px", fontWeight: 700, color: "white" }}>
            GYM<span style={{ color: "var(--color-accent)" }}>BUDDY</span>
          </span>
        </Link>

        {/* Desktop Nav items */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const active = item.href === "/groups" ? pathname === "/groups" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 14px",
                  borderRadius: "8px",
                  textDecoration: "none",
                  color: active ? "white" : "var(--color-text-muted)",
                  background: active ? "rgba(230,57,70,0.12)" : "transparent",
                  border: active ? "1px solid rgba(230,57,70,0.25)" : "1px solid transparent",
                  fontSize: "13px",
                  fontWeight: active ? 600 : 400,
                  transition: "all 0.15s",
                }}
              >
                <span style={{ color: active ? "var(--color-accent)" : "inherit" }}>{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </Link>
            );
          })}

          {/* Notifications */}
          <div ref={notifRefDesktop} style={{ position: "relative" }}>
            <button
              id="notif-btn"
              onClick={() => setShowNotif(!showNotif)}
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                background: "transparent",
                border: "1px solid transparent",
                color: "var(--color-text-muted)",
                cursor: "pointer",
                marginLeft: "4px",
                transition: "all 0.15s",
              }}
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <div
                  style={{
                    position: "absolute",
                    top: "4px",
                    right: "4px",
                    width: "8px",
                    height: "8px",
                    background: "var(--color-accent)",
                    borderRadius: "50%",
                    border: "2px solid var(--color-bg-primary)",
                  }}
                />
              )}
            </button>

            {showNotif && (
              <div
                className="glass-card"
                style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  right: 0,
                  width: "300px",
                  maxHeight: "360px",
                  overflowY: "auto",
                  zIndex: 200,
                }}
              >
                <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--color-border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "12px", letterSpacing: "0.05em", color: "var(--color-text-muted)" }}>NOTIFICATIONS</h3>
                    <button 
                      onClick={refreshNotifications}
                      style={{ background: "transparent", border: "none", color: "var(--color-text-muted)", cursor: "pointer", display: "flex", padding: "4px" }}
                      title="Refresh"
                    >
                      <RotateCcw size={12} />
                    </button>
                  </div>
                  {notifications.length > 0 && (
                    <button 
                      onClick={markAllAsRead}
                      style={{ background: "transparent", border: "none", color: "var(--color-accent)", fontSize: "11px", fontWeight: 600, cursor: "pointer" }}
                    >
                      Clear all
                    </button>
                  )}
                </div>
                {notifications.length === 0 ? (
                  <div style={{ padding: "24px", textAlign: "center", color: "var(--color-text-muted)", fontSize: "13px" }}>
                    No notifications yet
                  </div>
                ) : (
                  notifications.slice(0, 10).map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markAsRead(n.id)}
                      style={{
                        padding: "12px 16px",
                        borderBottom: "1px solid var(--color-border-subtle)",
                        background: n.read ? "transparent" : "rgba(230,57,70,0.04)",
                        cursor: "pointer",
                      }}
                    >
                      <p style={{ fontSize: "13px", color: n.read ? "var(--color-text-secondary)" : "white", lineHeight: 1.5 }}>
                        {n.message}
                      </p>
                      <p style={{ fontSize: "11px", color: "var(--color-text-muted)", marginTop: "4px" }}>
                        {new Date(n.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Avatar + logout */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "12px", paddingLeft: "12px", borderLeft: "1px solid var(--color-border-subtle)" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                background: user?.profileImage ? `url(${user.profileImage})` : "linear-gradient(135deg, var(--color-accent), var(--color-accent-dark))",
                backgroundSize: "cover",
                backgroundPosition: "center",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                flexShrink: 0,
              }}
            >
              {!user?.profileImage && <User size={18} />}
            </div>
            <button
              id="logout-btn"
              onClick={handleLogout}
              title="Logout"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "32px",
                height: "32px",
                background: "transparent",
                border: "none",
                color: "var(--color-text-muted)",
                cursor: "pointer",
                borderRadius: "6px",
                transition: "color 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-accent)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-muted)")}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>

        {/* Mobile Controls */}
        <div className="flex md:hidden items-center gap-3">
          {/* Mobile Notifications */}
          <div ref={notifRefMobile} style={{ position: "relative" }}>
            <button
              onClick={() => setShowNotif(!showNotif)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "36px",
                height: "36px",
                color: "var(--color-text-muted)",
              }}
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <div
                  style={{
                    position: "absolute",
                    top: "6px",
                    right: "6px",
                    width: "8px",
                    height: "8px",
                    background: "var(--color-accent)",
                    borderRadius: "50%",
                    border: "2px solid var(--color-bg-primary)",
                  }}
                />
              )}
            </button>
            {showNotif && (
              <div
                className="glass-card"
                style={{
                  position: "fixed",
                  top: "70px",
                  right: "10px",
                  left: "10px",
                  maxHeight: "360px",
                  overflowY: "auto",
                  zIndex: 200,
                }}
              >
                <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--color-border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "12px", letterSpacing: "0.05em", color: "var(--color-text-muted)" }}>NOTIFICATIONS</h3>
                    <button 
                      onClick={refreshNotifications}
                      style={{ background: "transparent", border: "none", color: "var(--color-text-muted)", cursor: "pointer", display: "flex", padding: "4px" }}
                    >
                      <RotateCcw size={14} />
                    </button>
                  </div>
                  {notifications.length > 0 && (
                    <button 
                      onClick={markAllAsRead}
                      style={{ background: "transparent", border: "none", color: "var(--color-accent)", fontSize: "11px", fontWeight: 600, cursor: "pointer" }}
                    >
                      Clear all
                    </button>
                  )}
                </div>
                {notifications.length === 0 ? (
                  <div style={{ padding: "24px", textAlign: "center", color: "var(--color-text-muted)", fontSize: "13px" }}>
                    No notifications yet
                  </div>
                ) : (
                  notifications.slice(0, 10).map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markAsRead(n.id)}
                      style={{
                        padding: "12px 16px",
                        borderBottom: "1px solid var(--color-border-subtle)",
                        background: n.read ? "transparent" : "rgba(230,57,70,0.04)",
                        cursor: "pointer",
                      }}
                    >
                      <p style={{ fontSize: "13px", color: n.read ? "var(--color-text-secondary)" : "white", lineHeight: 1.5 }}>
                        {n.message}
                      </p>
                      <p style={{ fontSize: "11px", color: "var(--color-text-muted)", marginTop: "4px" }}>
                        {new Date(n.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Hamburger Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            style={{
              width: "40px",
              height: "40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: isMenuOpen ? "rgba(230,57,70,0.15)" : "rgba(255,255,255,0.05)",
              border: `1px solid ${isMenuOpen ? "var(--color-accent)" : "var(--color-border-subtle)"}`,
              borderRadius: "8px",
              color: isMenuOpen ? "var(--color-accent)" : "white",
              transition: "all 0.2s ease",
            }}
          >
            {isMenuOpen ? <CloseIcon size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div
          style={{
            position: "fixed",
            top: "64px",
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(13,13,13,0.98)",
            backdropFilter: "blur(15px)",
            overflowY:"scroll",
            zIndex: 90,
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
          className="md:hidden fade-in"
        >
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "16px 20px",
                  borderRadius: "12px",
                  textDecoration: "none",
                  color: active ? "white" : "var(--color-text-secondary)",
                  background: active ? "rgba(230,57,70,0.15)" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${active ? "var(--color-accent)" : "var(--color-border-subtle)"}`,
                  fontFamily: "var(--font-heading)",
                  fontSize: "18px",
                  fontWeight: 600,
                  transition: "all 0.2s",
                }}
              >
                <span style={{ color: active ? "var(--color-accent)" : "inherit" }}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}

          <div style={{ marginTop: "auto", padding: "20px", borderTop: "1px solid var(--color-border-subtle)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  background: user?.profileImage ? `url(${user.profileImage})` : "linear-gradient(135deg, var(--color-accent), var(--color-accent-dark))",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                }}
              >
                {!user?.profileImage && <User size={24} />}
              </div>
              <div>
                <div style={{ fontSize: "16px", fontWeight: 700, color: "white" }}>{user?.name}</div>
                <div style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>{user?.email}</div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="btn-outline"
              style={{ width: "100%", padding: "14px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
            >
              <LogOut size={18} /> Logout
            </button>
          </div>
        </div>
      )}
    </>
  );
}
