import { useEffect, useRef, useState, type FormEvent } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { createWsClient, type ConnectionStatus, type WsChatMessage } from "@/lib/wsClient";
import { useAuthStore } from "@/store/authStore";

const STATUS_LABELS: Record<ConnectionStatus, string> = {
  connecting: "Подключение...",
  open: "Подключено",
  reconnecting: "Переподключение...",
  closed: "Нет соединения",
};

function getMockHistory(courseId: string): WsChatMessage[] {
  return [
    {
      id: `${courseId}-welcome`,
      senderId: "mentor-1",
      senderName: "Анна Ковалёва",
      text: "Добро пожаловать в чат курса! Здесь можно задавать вопросы по материалам.",
      createdAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    },
    {
      id: `${courseId}-question`,
      senderId: "student-2",
      senderName: "Михаил",
      text: "Подскажите, пожалуйста, какой редактор лучше использовать для практики?",
      createdAt: new Date(Date.now() - 1000 * 60 * 7).toISOString(),
    },
    {
      id: `${courseId}-answer`,
      senderId: "mentor-1",
      senderName: "Анна Ковалёва",
      text: "Подойдет любой редактор с поддержкой TypeScript. В VS Code удобно начать с готовых расширений.",
      createdAt: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
    },
  ];
}

function formatMessageTime(createdAt: string): string {
  return new Intl.DateTimeFormat("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(createdAt));
}

export function ChatPage() {
  const { courseId = "" } = useParams<{ courseId: string }>();
  const accessToken = useAuthStore((state) => state.accessToken);
  const currentUser = useAuthStore((state) => state.user);
  const [messages, setMessages] = useState<WsChatMessage[]>(() => getMockHistory(courseId));
  const [status, setStatus] = useState<ConnectionStatus>("connecting");
  const [draft, setDraft] = useState("");
  const clientRef = useRef<ReturnType<typeof createWsClient> | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!courseId || !accessToken) return;

    const url = `ws://localhost:8080/ws/chat/${encodeURIComponent(courseId)}?token=${encodeURIComponent(accessToken)}`;
    const client = createWsClient(url);
    clientRef.current = client;
    const unsubscribeMessages = client.onMessage((message) => {
      setMessages((current) => [...current, message]);
    });
    const unsubscribeStatus = client.onStatus(setStatus);

    return () => {
      unsubscribeMessages();
      unsubscribeStatus();
      client.close();
      clientRef.current = null;
    };
  }, [courseId, accessToken]);

  function handleSend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = draft.trim();
    if (!text || status !== "open" || !accessToken) return;

    clientRef.current?.send(text);
    setDraft("");
  }

  if (!accessToken) {
    return <p className="text-sm text-ink-soft">Войдите в аккаунт, чтобы присоединиться к чату курса.</p>;
  }

  return (
    <div className="mx-auto flex h-[70vh] min-h-[440px] w-full max-w-3xl flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-display text-2xl text-ink">Чат курса #{courseId}</h1>
        <span
          className={cn(
            "flex shrink-0 items-center gap-2 text-xs font-medium",
            status === "open" ? "text-pine" : "text-danger",
          )}
        >
          <span
            className={cn(
              "h-2 w-2 rounded-full",
              status === "open" ? "bg-pine" : "bg-danger",
            )}
            aria-hidden="true"
          />
          {STATUS_LABELS[status]}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto rounded-md border border-line bg-card p-4" aria-live="polite">
        {messages.length === 0 ? (
          <p className="text-sm text-ink-faint">Сообщений пока нет. Начните обсуждение курса.</p>
        ) : (
          <ul className="flex flex-col gap-4">
            {messages.map((message) => {
              const isOwn = message.senderId === currentUser?.id;
              return (
                <li key={message.id} className={cn("flex flex-col", isOwn ? "items-end" : "items-start")}>
                  <div className={cn("flex max-w-[85%] flex-col", isOwn ? "items-end" : "items-start")}>
                    <span className="text-xs text-ink-faint">
                      {message.senderName} · {formatMessageTime(message.createdAt)}
                    </span>
                    <span
                      className={cn(
                        "mt-1 rounded-md px-3 py-2 text-sm leading-6",
                        isOwn ? "bg-pine text-white" : "bg-muted text-ink",
                      )}
                    >
                      {message.text}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        <div ref={bottomRef} />
      </div>

      <form className="flex gap-2" onSubmit={handleSend}>
        <Input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Написать сообщение..."
          aria-label="Сообщение"
          disabled={status !== "open"}
        />
        <Button type="submit" disabled={!draft.trim() || status !== "open"}>
          Отправить
        </Button>
      </form>
    </div>
  );
}
