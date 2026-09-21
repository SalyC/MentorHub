import { NavLink } from "react-router-dom";
import { Menu, X, Bell, GraduationCap } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface HeaderProps {
  mobileNavOpen: boolean;
  onToggleMobileNav: () => void;
}

const linkClasses = ({ isActive }: { isActive: boolean }) =>
  cn(
    "text-sm font-medium transition-colors hover:text-pine",
    isActive ? "text-pine" : "text-ink-soft",
  );

export function Header({ mobileNavOpen, onToggleMobileNav }: HeaderProps) {
  const { isAuthenticated, user, hasRole, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <NavLink to="/" className="flex items-center gap-2 font-display text-lg text-ink">
            <GraduationCap className="h-5 w-5 text-pine" aria-hidden="true" />
            MentorHub
          </NavLink>

          <nav className="hidden items-center gap-6 md:flex" aria-label="Основная навигация">
            <NavLink to="/" className={linkClasses} end>
              Курсы
            </NavLink>
            {hasRole("mentor") && (
              <NavLink to="/mentor" className={linkClasses}>
                Кабинет ментора
              </NavLink>
            )}
            {hasRole("admin") && (
              <NavLink to="/admin" className={linkClasses}>
                Админ-панель
              </NavLink>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <button
                type="button"
                aria-label="Уведомления"
                className="hidden rounded p-2 text-ink-soft hover:bg-muted md:inline-flex"
              >
                <Bell className="h-5 w-5" />
              </button>
              <NavLink
                to="/profile"
                className="hidden text-sm font-medium text-ink-soft hover:text-pine md:inline-block"
              >
                {user?.name}
              </NavLink>
              <Button variant="outline" size="sm" className="hidden md:inline-flex" onClick={logout}>
                Выйти
              </Button>
            </>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Button variant="ghost" size="sm" asChild>
                <NavLink to="/login">Вход</NavLink>
              </Button>
              <Button variant="primary" size="sm" asChild>
                <NavLink to="/register">Регистрация</NavLink>
              </Button>
            </div>
          )}

          <button
            type="button"
            className="inline-flex rounded p-2 text-ink hover:bg-muted md:hidden"
            aria-label={mobileNavOpen ? "Закрыть меню" : "Открыть меню"}
            aria-expanded={mobileNavOpen}
            onClick={onToggleMobileNav}
          >
            {mobileNavOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>
    </header>
  );
}
