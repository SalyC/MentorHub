import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, UserRole } from "@/types";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setSession: (user: User, accessToken: string) => void;
  devLogin: (role: Extract<UserRole, "student" | "mentor" | "admin">) => void;
  updateUser: (user: User) => void;
  logout: () => void;
}

/**
 * ВРЕМЕННО: persist используется для разработки без бэкенда,
 * чтобы devLogin выживал перезагрузку страницы.
 * Перед продом — убрать persist для accessToken (оставить в памяти)
 * или перейти на httpOnly cookie, как описано в apiClient.ts.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,

      setSession: (user, accessToken) =>
        set({ user, accessToken, isAuthenticated: true }),

      devLogin: (role) =>
        set({
          user: {
            id: `dev-${role}`,
            email: `${role}@mentorhub.local`,
            name: `Dev ${role}`,
            role,
            telegramLinked: false,
          },
          accessToken: `dev-access-token-${role}`,
          isAuthenticated: true,
        }),

      updateUser: (user) => set({ user }),

      logout: () =>
        set({ user: null, accessToken: null, isAuthenticated: false }),
    }),
    {
      name: "mentorhub-auth", // ключ в localStorage
    },
  ),
);