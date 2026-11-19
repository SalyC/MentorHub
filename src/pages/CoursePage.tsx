import { useParams } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { BookOpen, Plus } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Card, CardContent } from "@/components/ui/Card"
import { apiClient } from "@/lib/apiClient"
import type { Course, Module } from "@/types"
import { useState } from "react"
import { toast } from "sonner"
import { useAuthStore } from "@/store/authStore"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/Dialog"
import { Input } from "@/components/ui/Input"



export function CoursePage() {
  const { id = "" } = useParams<{ id: string }>()
  const user = useAuthStore((state) => state.user)
  const queryClient = useQueryClient()
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [orderIndex, setOrderIndex] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const addModuleMutation = useMutation({
    mutationFn: (payload: { title: string; content: string; order_index: number }) =>
      apiClient.post(`/courses/${id}/modules`, payload),
    onSuccess: () => {
      setTitle("")
      setContent("")
      setOrderIndex("")
      setIsOpen(false)
      queryClient.invalidateQueries({ queryKey: ["modules", id] })
      toast.success("Модуль успешно добавлен!")
    },
    onError: () => {
      toast.error("Ошибка при создании модуля. Проверьте права.")
    }
  })

const handleAddModule = (e: React.FormEvent) => {
  e.preventDefault()
  addModuleMutation.mutate({ 
    title, 
    content, 
    order_index: Number(orderIndex) // ! Бэкенд ждет int, а input отдает string
  })
}
  const courseQueryKey = ["course", id] as const
  const courseQuery = useQuery({ 
    queryKey: courseQueryKey, 
    queryFn: () => apiClient.get<Course>(`/courses/${id}`) 
  })
  const modulesQuery = useQuery({
    queryKey: ["modules", id],
    queryFn: () => apiClient.get<Module[]>(`/courses/${id}/modules`),
  })
  
  if (courseQuery.isLoading) return <CourseSkeleton />
  if (courseQuery.isError || !courseQuery.data) {
    return (
      <p className="rounded border border-danger-50 bg-danger-50 p-4 text-sm text-danger" role="alert">
        Не удалось загрузить курс. Возможно, он больше недоступен.
      </p>
    )
  }
  

  const course = courseQuery.data
  return (
    <div className="flex flex-col gap-8">
      <section className="grid gap-6 md:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)] md:items-center">
        <img 
          src={course.cover_url || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1000&auto=format&fit=crop"} 
          onError={(e) => {
            e.currentTarget.src = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1000&auto=format&fit=crop";
          }}
          alt={course.title} 
          className="aspect-[16/9] w-full object-cover" 
        />
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
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl text-ink">Модули курса</h2>

          {/* Показываем кнопку только ментору или админу */}
          {(user?.role === "mentor" || user?.role === "admin") && (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" /> Добавить модуль
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Новый модуль</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddModule} className="flex flex-col gap-4 mt-4">
                  <Input 
                    placeholder="Название модуля" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    required 
                  />
                  <Input 
                    placeholder="Содержание (текст)" 
                    value={content} 
                    onChange={(e) => setContent(e.target.value)} 
                    required 
                  />
                  <Input 
                    type="number" // Чтобы вводились только цифры
                    placeholder="Порядковый номер (1, 2, 3...)" 
                    value={orderIndex} 
                    onChange={(e) => setOrderIndex(e.target.value)} 
                    required 
                  />
                  <Button type="submit" disabled={addModuleMutation.isPending}>
                    {addModuleMutation.isPending ? "Создание..." : "Создать модуль"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
        
        <div className="grid gap-3 sm:grid-cols-2">
          {modulesQuery.data?.map((module, index) => (
            <Card key={module.id}>
              <CardContent className="flex gap-4 p-5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-pine-50 text-sm font-medium text-pine">
                  {module.order_index || index + 1}
                </span>
                <div>
                  <h3 className="font-display text-lg text-ink">{module.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-ink-soft">{module.content}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
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
  )
}
