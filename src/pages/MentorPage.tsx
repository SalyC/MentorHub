import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"
import { ClipboardList, BookOpen } from "lucide-react"
import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/apiClient"
import { useAuthStore } from "@/store/authStore"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"

export function MentorPage() {
  const queryClient = useQueryClient()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [coverUrl, setCoverUrl] = useState("")

  const createCourseMutation = useMutation({
    mutationFn: (payload: { title: string; description: string; cover_url: string }) =>
      apiClient.post("/courses", payload),
    onSuccess: () => {
      setTitle("")
      setDescription("")
      setCoverUrl("")
      queryClient.invalidateQueries({ queryKey: ["courses"] })
      alert("Курс успешно создан!")
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createCourseMutation.mutate({ title, description, cover_url: coverUrl })
  }

  const user = useAuthStore((state) => state.user)
  if (user?.role !== "mentor" && user?.role !== "admin") {
    return <p className="text-danger">У вас нет прав для доступа к кабинету ментора.</p>
  }

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
        <h2 className="font-display text-lg text-ink">Создать новый курс</h2>
        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input 
                placeholder="Название курса" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                required 
              />
              <Input 
                placeholder="Описание курса" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                required 
              />
              <Input 
                placeholder="Ссылка на обложку (URL)" 
                value={coverUrl} 
                onChange={(e) => setCoverUrl(e.target.value)} 
              />
              <Button 
                type="submit" 
                disabled={createCourseMutation.isPending}
              >
                {createCourseMutation.isPending ? "Создание..." : "Создать курс"}
              </Button>

              {createCourseMutation.isError && (
                <p className="text-sm text-danger">Ошибка при создании курса. Проверьте авторизацию.</p>
              )}
            </form>
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
  )
}
