import { useState, type FormEvent } from "react"
import { NavLink, useNavigate } from "react-router-dom"
import { useMutation } from "@tanstack/react-query"
import { apiClient } from "@/lib/apiClient"
import { ApiError } from "@/lib/apiClient"
import { useAuthStore } from "@/store/authStore"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { validateEmail, validatePassword } from "@/lib/validation"
import type { User } from "@/types"

interface RegisterResponse {
  user: User
  accessToken: string
  refreshToken?: string
}

function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError && typeof error.body === "object" && error.body !== null) {
    const message = (error.body as { error?: unknown }).error
    if (typeof message === "string" && message) return message
  }

  return "Не удалось зарегистрироваться. Попробуйте другой email."
}

export function RegisterPage() {
  const navigate = useNavigate()
  const setSession = useAuthStore((state) => state.setSession)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [emailError, setEmailError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  const registerMutation = useMutation({
    mutationFn: (payload: { email: string; password: string }) =>
      apiClient.post<RegisterResponse>("/auth/register", payload, { skipAuth: true }),
    onSuccess: (data) => {
      setSession(data.user, data.accessToken)
      if (data.refreshToken) {
        // TODO: переедет в httpOnly cookie.
        localStorage.setItem("refreshToken", data.refreshToken)
      }
      navigate("/")
    },
  })

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextEmailError = validateEmail(email)
    const nextPasswordError = validatePassword(password)
    setEmailError(nextEmailError)
    setPasswordError(nextPasswordError)

    if (nextEmailError || nextPasswordError) return

    registerMutation.mutate({ email, password })
  }

  return (
    <div className="mx-auto flex w-full max-w-[400px] flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl text-ink">Регистрация</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Создайте аккаунт, чтобы записываться на курсы или вести их как ментор.
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
              setEmail(e.target.value)
              setEmailError(null)
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
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              setPasswordError(null)
            }}
          />
          {passwordError && <p className="text-sm text-danger">{passwordError}</p>}
        </div>

        {registerMutation.isError && (
          <p className="text-sm text-danger" role="alert">
            {getErrorMessage(registerMutation.error)}
          </p>
        )}

        <Button type="submit" disabled={registerMutation.isPending}>
          {registerMutation.isPending ? "Загрузка..." : "Зарегистрироваться"}
        </Button>
      </form>

      <p className="text-sm text-ink-soft">
        Уже есть аккаунт?{" "}
        <NavLink to="/login" className="font-medium text-pine hover:underline">
          Войти
        </NavLink>
      </p>
    </div>
  )
}
