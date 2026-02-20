import { create } from "zustand";
import { persist } from "zustand/middleware";

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
    setUser: (user: UserProfile | null) => void;
    setLoading: (loading: boolean) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isLoading: false,
            setUser: (user) => set({ user }),
            setLoading: (isLoading) => set({ isLoading }),
            logout: () => {
                set({ user: null });
                fetch("/api/auth/logout", { method: "POST" });
            },
        }),
        {
            name: "auth-storage",
            partialize: (state) => ({ user: state.user }),
        }
    )
);
