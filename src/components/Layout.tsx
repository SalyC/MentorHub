import { useAuthStore } from "@/store/authStore";
import type { UserRole } from "@/types";

const DEV_ROLES: Array<Extract<UserRole, "student" | "mentor" | "admin">> = [
  "student",
  "mentor",
  "admin",
];

export function DevDebugPanel() {
  const devLogin = useAuthStore((state) => state.devLogin);

  if (!import.meta.env.DEV) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 rounded bg-yellow-100 p-3 shadow">
      <p className="mb-2 text-xs font-medium text-ink">Dev login</p>
      <div className="flex gap-2">
        {DEV_ROLES.map((role) => (
          <button
            key={role}
            type="button"
            onClick={() => devLogin(role)}
            className="rounded border border-yellow-300 bg-yellow-50 px-2 py-1 text-xs font-medium text-ink hover:bg-yellow-200"
          >
            {role}
          </button>
        ))}
      </div>
    </div>
  );
}