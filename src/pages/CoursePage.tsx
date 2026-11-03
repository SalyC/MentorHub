import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { MOCK_MODULES } from "@/lib/mocks";
import { apiClient } from "@/lib/apiClient";
import type { Course } from "@/types";


export function CoursePage() {
  const { id = "" } = useParams<{ id: string }>();
  const courseQueryKey = ["course", id] as const;
  const courseQuery = useQuery({ 
    queryKey: courseQueryKey, 
    queryFn: () => apiClient.get<Course>(`/courses/${id}`) 
  });

  if (courseQuery.isLoading) return <CourseSkeleton />;
  if (courseQuery.isError || !courseQuery.data) {
    return (
      <p className="rounded border border-danger-50 bg-danger-50 p-4 text-sm text-danger" role="alert">
        Не удалось загрузить курс. Возможно, он больше недоступен.
      </p>
    );
  }

  const course = courseQuery.data;
  return (
    <div className="flex flex-col gap-8">
      <section className="grid gap-6 md:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)] md:items-center">
        <img src={course.cover_url} alt="" className="aspect-[16/9] w-full rounded-md object-cover" />
        <div className="flex flex-col items-start gap-4">
          <div>
            <p className="text-sm text-ink-faint">Ментор: {course.mentor_id}</p>
            <h1 className="mt-2 font-display text-3xl text-ink">{course.title}</h1>
          </div>
          <p className="leading-7 text-ink-soft">{course.description}</p>
          <p className="text-sm text-ink-faint">{0} студентов уже учатся на курсе</p>
          <Button disabled>
            Скоро
          </Button>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-display text-2xl text-ink">Модули курса</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {MOCK_MODULES.map((module, index) => (
            <Card key={module.id}>
              <CardContent className="flex gap-4 p-5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-pine-50 text-sm font-medium text-pine">
                  {index + 1}
                </span>
                <div>
                  <h3 className="font-display text-lg text-ink">{module.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-ink-soft">{module.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}

function CourseSkeleton() {
  return (
    <div className="animate-pulse space-y-8" aria-label="Загрузка курса">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="aspect-[16/9] rounded-md bg-muted" />
        <div className="space-y-4 py-4">
          <div className="h-4 w-1/3 rounded bg-muted" />
          <div className="h-10 w-4/5 rounded bg-muted" />
          <div className="h-20 rounded bg-muted" />
          <div className="h-10 w-32 rounded bg-muted" />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <BookOpen className="h-5 w-5 text-ink-faint" />
        <div className="h-7 w-40 rounded bg-muted" />
      </div>
    </div>
  );
}
