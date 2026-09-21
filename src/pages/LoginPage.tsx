import { useState, type FormEvent } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { ApiError } from "@/lib/apiClient";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { validateEmail, validatePassword } from "@/lib/validation";
import type { User } from "@/types";

interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken?: string;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError && typeof error.body === "object" && error.body !== null) {
    const message = (error.body as { message?: unknown }).message;
    if (typeof message === "string" && message) return message;
  }

  return "Не удалось войти. Проверьте email и пароль.";
}

export function LoginPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const loginMutation = useMutation({
    mutationFn: (payload: { email: string; password: string }) =>
      apiClient.post<LoginResponse>("/auth/login", payload, { skipAuth: true }),
    onSuccess: (data) => {
      setSession(data.user, data.accessToken);
      if (data.refreshToken) {
        // TODO: переедет в httpOnly cookie.
        localStorage.setItem("refreshToken", data.refreshToken);
      }
      navigate("/");
    },
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextEmailError = validateEmail(email);
    const nextPasswordError = validatePassword(password);
    setEmailError(nextEmailError);
    setPasswordError(nextPasswordError);

    if (nextEmailError || nextPasswordError) return;

    loginMutation.mutate({ email, password });
  }

  return (
    <div className="mx-auto flex w-full max-w-[400px] flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl text-ink">Вход</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Войдите, чтобы продолжить обучение или проверку заданий.
        </p>
      </div>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-medium text-ink">
            Email
          </label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setEmailError(null);
            }}
          />
          {emailError && <p className="text-sm text-danger">{emailError}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-sm font-medium text-ink">
            Пароль
          </label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setPasswordError(null);
            }}
          />
          {passwordError && <p className="text-sm text-danger">{passwordError}</p>}
        </div>

        {loginMutation.isError && (
          <p className="text-sm text-danger" role="alert">
            {getErrorMessage(loginMutation.error)}
          </p>
        )}

        <Button type="submit" disabled={loginMutation.isPending}>
          {loginMutation.isPending ? "Загрузка..." : "Войти"}
        </Button>
      </form>

      <p className="text-sm text-ink-soft">
        Нет аккаунта?{" "}
        <NavLink to="/register" className="font-medium text-pine hover:underline">
          Зарегистрироваться
        </NavLink>
      </p>
    </div>
  );
}
