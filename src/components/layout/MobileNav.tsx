import { NavLink } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  open: boolean;
  onNavigate: () => void;
}

const linkClasses = ({ isActive }: { isActive: boolean }) =>
  cn(
    "block rounded px-3 py-2 text-base font-medium",
    isActive ? "bg-pine-50 text-pine" : "text-ink-soft hover:bg-muted",
  );

export function MobileNav({ open, onNavigate }: MobileNavProps) {
  const { isAuthenticated, hasRole, logout } = useAuth();

  if (!open) return null;

  return (
    <nav
      className="border-b border-line bg-paper md:hidden"
      aria-label="Мобильная навигация"
    >
      <div className="container flex flex-col gap-1 py-3">
        <NavLink to="/" className={linkClasses} onClick={onNavigate} end>
          Курсы
        </NavLink>

        {isAuthenticated ? (
          <>
            <NavLink to="/profile" className={linkClasses} onClick={onNavigate}>
              Профиль
            </NavLink>
            {hasRole("mentor") && (
              <NavLink to="/mentor" className={linkClasses} onClick={onNavigate}>
                Кабинет ментора
              </NavLink>
            )}
            {hasRole("admin") && (
              <NavLink to="/admin" className={linkClasses} onClick={onNavigate}>
                Админ-панель
              </NavLink>
            )}
            <button
              type="button"
              className="mt-2 rounded px-3 py-2 text-left text-base font-medium text-danger hover:bg-danger-50"
              onClick={() => {
                logout();
                onNavigate();
              }}
            >
              Выйти
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login" className={linkClasses} onClick={onNavigate}>
              Вход
            </NavLink>
            <NavLink to="/register" className={linkClasses} onClick={onNavigate}>
              Регистрация
            </NavLink>
          </>
        )}
      </div>
    </nav>
  );
}
