import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { enrollMockCourse, fetchMockCourses, type MockCourse } from "@/lib/mocks";

const coursesQueryKey = ["courses"] as const;

export function HomePage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const coursesQuery = useQuery({ queryKey: coursesQueryKey, queryFn: fetchMockCourses });
  const enrollMutation = useMutation({
    mutationFn: enrollMockCourse,
    onMutate: async (courseId) => {
      await queryClient.cancelQueries({ queryKey: coursesQueryKey });
      const previousCourses = queryClient.getQueryData<MockCourse[]>(coursesQueryKey);
      queryClient.setQueryData<MockCourse[]>(coursesQueryKey, (courses) =>
        courses?.map((course) => course.id === courseId ? { ...course, isEnrolled: true } : course),
      );
      return { previousCourses };
    },
    onError: (_error, _courseId, context) => {
      queryClient.setQueryData(coursesQueryKey, context?.previousCourses);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: coursesQueryKey }),
  });

  const filteredCourses = coursesQuery.data?.filter((course) =>
    course.title.toLocaleLowerCase().includes(search.toLocaleLowerCase()),
  );

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-3xl text-ink">Курсы MentorHub</h1>
        <p className="max-w-prose text-ink-soft">Выберите направление и учитесь у практикующих менторов.</p>
      </div>
      <Input
        type="search"
        aria-label="Поиск курсов"
        placeholder="Поиск по названию курса"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        className="max-w-md"
      />

      {coursesQuery.isLoading && <CourseGridSkeleton />}
      {coursesQuery.isError && (
        <p className="rounded border border-danger-50 bg-danger-50 p-4 text-sm text-danger" role="alert">
          Не удалось загрузить курсы. Попробуйте обновить страницу.
        </p>
      )}
      {coursesQuery.isSuccess && filteredCourses?.length === 0 && (
        <p className="py-8 text-center text-ink-soft">Курсы не найдены.</p>
      )}
      {coursesQuery.isSuccess && filteredCourses && filteredCourses.length > 0 && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              isEnrolling={enrollMutation.isPending && enrollMutation.variables === course.id}
              onEnroll={() => enrollMutation.mutate(course.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CourseCard({ course, isEnrolling, onEnroll }: {
  course: MockCourse;
  isEnrolling: boolean;
  onEnroll: () => void;
}) {
  return (
    <Card className="group flex h-full flex-col overflow-hidden transition-shadow hover:shadow-md">
      <Link to={`/courses/${course.id}`} className="flex flex-1 flex-col focus-visible:outline-none">
        <img src={course.coverUrl} alt="" className="aspect-[16/9] w-full object-cover" />
        <CardContent className="flex flex-1 flex-col gap-3 p-5">
          <div>
            <h2 className="font-display text-xl text-ink group-hover:text-pine">{course.title}</h2>
            <p className="mt-1 text-sm text-ink-faint">Ментор: {course.mentorName}</p>
          </div>
          <p className="text-sm leading-6 text-ink-soft">{course.description}</p>
          <p className="mt-auto text-xs text-ink-faint">{course.studentsCount} студентов</p>
        </CardContent>
      </Link>
      <div className="px-5 pb-5">
        <Button
          type="button"
          size="sm"
          variant={course.isEnrolled ? "outline" : "primary"}
          disabled={course.isEnrolled || isEnrolling}
          onClick={onEnroll}
        >
          {isEnrolling ? "Записываем..." : course.isEnrolled ? "Вы записаны" : "Записаться"}
        </Button>
      </div>
    </Card>
  );
}

function CourseGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-label="Загрузка курсов">
      {Array.from({ length: 6 }, (_, index) => (
        <div key={index} className="animate-pulse overflow-hidden rounded-md border border-line bg-card">
          <div className="aspect-[16/9] bg-muted" />
          <div className="space-y-3 p-5">
            <div className="h-6 w-3/4 rounded bg-muted" />
            <div className="h-4 w-full rounded bg-muted" />
            <div className="h-4 w-5/6 rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}
