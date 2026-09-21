import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { enrollMockCourse, fetchMockCourse, MOCK_MODULES, type MockCourse } from "@/lib/mocks";

const coursesQueryKey = ["courses"] as const;

export function CoursePage() {
  const { id = "" } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const courseQueryKey = ["course", id] as const;
  const courseQuery = useQuery({ queryKey: courseQueryKey, queryFn: () => fetchMockCourse(id) });
  const enrollMutation = useMutation({
    mutationFn: enrollMockCourse,
    onMutate: async (courseId) => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: courseQueryKey }),
        queryClient.cancelQueries({ queryKey: coursesQueryKey }),
      ]);
      const previousCourse = queryClient.getQueryData<MockCourse>(courseQueryKey);
      const previousCourses = queryClient.getQueryData<MockCourse[]>(coursesQueryKey);
      const markEnrolled = (course?: MockCourse) =>
        course?.id === courseId ? { ...course, isEnrolled: true } : course;
      queryClient.setQueryData<MockCourse>(courseQueryKey, markEnrolled(previousCourse));
      queryClient.setQueryData<MockCourse[]>(coursesQueryKey, (courses) =>
        courses?.map((course) => markEnrolled(course) as MockCourse),
      );
      return { previousCourse, previousCourses };
    },
    onError: (_error, _courseId, context) => {
      queryClient.setQueryData(courseQueryKey, context?.previousCourse);
      queryClient.setQueryData(coursesQueryKey, context?.previousCourses);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: courseQueryKey });
      queryClient.invalidateQueries({ queryKey: coursesQueryKey });
    },
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
        <img src={course.coverUrl} alt="" className="aspect-[16/9] w-full rounded-md object-cover" />
        <div className="flex flex-col items-start gap-4">
          <div>
            <p className="text-sm text-ink-faint">Ментор: {course.mentorName}</p>
            <h1 className="mt-2 font-display text-3xl text-ink">{course.title}</h1>
          </div>
          <p className="leading-7 text-ink-soft">{course.description}</p>
          <p className="text-sm text-ink-faint">{course.studentsCount} студентов уже учатся на курсе</p>
          <Button onClick={() => enrollMutation.mutate(course.id)} disabled={course.isEnrolled || enrollMutation.isPending}>
            {enrollMutation.isPending ? "Записываем..." : course.isEnrolled ? "Вы записаны" : "Записаться"}
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
