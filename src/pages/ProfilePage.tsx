import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { useAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/authStore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Send } from "lucide-react";

export function ProfilePage() {
  const { user } = useAuth();
  const updateUser = useAuthStore((state) => state.updateUser);
  const [name, setName] = useState(user?.name ?? "");
  const [telegramCode, setTelegramCode] = useState<string | null>(null);

  const saveProfileMutation = useMutation({
    mutationFn: () => apiClient.put("/users/me", { name }),
    onSuccess: () => {
      if (user) updateUser({ ...user, name });
    },
  });

  const requestTelegramCodeMutation = useMutation({
    mutationFn: () =>
      apiClient.post<{ code: string }>("/users/telegram/connect"),
    onSuccess: (data) => setTelegramCode(data.code),
  });

  if (!user) return null;

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <h1 className="font-display text-2xl text-ink">Профиль</h1>

      <Card>
        <CardHeader>
          <CardTitle>Личные данные</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="name" className="text-sm font-medium text-ink">
              Имя
            </label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-ink">Email</span>
            <p className="text-sm text-ink-faint">{user.email}</p>
          </div>

          <div>
            <Button
              size="sm"
              onClick={() => saveProfileMutation.mutate()}
              disabled={saveProfileMutation.isPending}
            >
              {saveProfileMutation.isPending ? "Сохраняем..." : "Сохранить изменения"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Telegram</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {user.telegramLinked ? (
            <p className="text-sm text-pine">Telegram уже привязан к аккаунту.</p>
          ) : (
            <>
              <p className="text-sm text-ink-soft">
                Привяжите Telegram, чтобы получать уведомления о проверке заданий и
                сообщениях в чате.
              </p>
              {telegramCode ? (
                <p className="text-sm text-ink">
                  Отправьте боту код: <span className="font-medium">{telegramCode}</span>
                </p>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => requestTelegramCodeMutation.mutate()}
                  disabled={requestTelegramCodeMutation.isPending}
                >
                  <Send className="h-4 w-4" />
                  Получить код привязки
                </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
