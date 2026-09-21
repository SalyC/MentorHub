import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { ClipboardList, BookOpen } from "lucide-react";

export function MentorPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl text-ink">Кабинет ментора</h1>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-lg text-ink">Мои курсы</h2>
        <Card>
          <CardContent className="flex items-center gap-3 p-6 text-sm text-ink-faint">
            <BookOpen className="h-5 w-5" />
            Список ваших курсов появится после подключения `GET /courses?mentorId=me`.
          </CardContent>
        </Card>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-lg text-ink">Решения на проверке</h2>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Очередь проверки пуста</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-3 pt-0 text-sm text-ink-faint">
            <ClipboardList className="h-5 w-5" />
            Здесь появятся отправленные студентами решения, ожидающие оценки.
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
