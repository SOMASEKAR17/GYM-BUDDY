"use client";
import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";

export default function AuthLoader() {
  const { setUser, setHydrated, isHydrated } = useAuthStore();

  useEffect(() => {
    const syncAuth = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setUser(data.user);
          }
        } else if (res.status === 401) {
          // If 401, server says we are not logged in, but store might have stale user
          // We don't necessarily want to clear it immediately if we're offline, 
          // but if we just got a 401, the user should be null.
          setUser(null);
        }
      } catch (error) {
        console.error("Auth sync failed:", error);
      } finally {
        setHydrated(true);
      }
    };

    syncAuth();
  }, [setUser, setHydrated]);

  return null;
}
