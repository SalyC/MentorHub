import { useAuthStore } from "@/store/authStore";
import type { UserRole } from "@/types";

export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);

  const hasRole = (...roles: UserRole[]): boolean =>
    user !== null && roles.includes(user.role);

  return { user, isAuthenticated, hasRole, logout };
}
