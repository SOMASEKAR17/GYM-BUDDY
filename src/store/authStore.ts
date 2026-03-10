import { create } from "zustand";
import { persist } from "zustand/middleware";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";

export interface UserProfile {
    id: string;
    name: string;
    email: string;
    age?: number;
    gender?: string;
    bio?: string;
    gymLocation?: string;
    fitnessLevel?: string;
    fitnessGoal?: string;
    profileImage?: string;
    course?: string;
    year?: string;
    questionnaire?: unknown;
}

interface AuthState {
    user: UserProfile | null;
    isLoading: boolean;
    isHydrated: boolean;
    setUser: (user: UserProfile | null) => void;
    setLoading: (loading: boolean) => void;
    setHydrated: (hydrated: boolean) => void;
    logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isLoading: false,
            isHydrated: false,
            setUser: (user) => set({ user }),
            setLoading: (isLoading) => set({ isLoading }),
            setHydrated: (isHydrated) => set({ isHydrated }),
            logout: async () => {
                try {
                    // Sign out from Firebase first
                    await signOut(auth);
                    // Clear the server-side session cookie
                    await fetch("/api/auth/logout", { method: "POST" });
                } catch (error) {
                    console.error("Logout error:", error);
                } finally {
                    // Set user to null last to trigger UI transition
                    set({ user: null });
                }
            },
        }),
        {
            name: "auth-storage",
            partialize: (state) => ({ user: state.user }),
            onRehydrateStorage: () => (state) => {
                state?.setHydrated(true);
            },
        }
    )
);

