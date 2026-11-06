import { useState } from "react"
import { Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/Button"
import { Card, CardContent } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { apiClient } from "@/lib/apiClient"
import type { Course } from "@/types"

const coursesQueryKey = ["courses"] as const

export function HomePage() {
  const [search, setSearch] = useState("")
  
  const coursesQuery = useQuery({
    queryKey: coursesQueryKey,
    queryFn: () => apiClient.get<Course[]>("/courses"),
  })

  const filteredCourses = coursesQuery.data?.filter((course) =>
    course.title.toLocaleLowerCase().includes(search.toLocaleLowerCase()),
  )

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
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  )
}

function CourseCard({ course }: { course: Course }) {
  return (
    <Card className="group flex h-full flex-col overflow-hidden transition-shadow hover:shadow-md">
      <Link to={`/courses/${course.id}`} className="flex flex-1 flex-col focus-visible:outline-none">
        <img 
          src={course.cover_url || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1000&auto=format&fit=crop"} 
          onError={(e) => {
            e.currentTarget.src = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1000&auto=format&fit=crop";
          }}
          alt={course.title} 
          className="aspect-[16/9] w-full object-cover" 
        />
        <CardContent className="flex flex-1 flex-col gap-3 p-5">
          <div>
            <h2 className="font-display text-xl text-ink group-hover:text-pine">{course.title}</h2>
            <p className="mt-1 text-sm text-ink-faint">Ментор ID: {course.mentor_id}</p>
          </div>
          <p className="text-sm leading-6 text-ink-soft">{course.description}</p>
          <p className="mt-auto text-xs text-ink-faint">0 студентов</p>
        </CardContent>
      </Link>
      <div className="px-5 pb-5">
        <Button type="button" size="sm" variant="primary" disabled>
          Скоро
        </Button>
      </div>
    </Card>
  )
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
  )
}