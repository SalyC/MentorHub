import { useState, type FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { AlertCircle, CheckCircle2, Clock3, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { MOCK_ASSIGNMENTS, submitMockAssignment, type MockAssignment } from "@/lib/mocks";

function getDeadlineState(deadline: string): "past" | "soon" | "normal" {
  const hoursLeft = (new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60);
  if (hoursLeft <= 0) return "past";
  if (hoursLeft < 24) return "soon";
  return "normal";
}

function formatDeadline(deadline: string): string {
  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(deadline));
}

export function AssignmentPage() {
  const { id = "" } = useParams<{ id: string }>();
  const assignment = MOCK_ASSIGNMENTS.find((item) => item.id === id);
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const submitMutation = useMutation({
    mutationFn: () => submitMockAssignment(id, text, fileName),
  });

  if (!assignment) {
    return (
      <p className="rounded border border-danger-50 bg-danger-50 p-4 text-sm text-danger" role="alert">
        Задание не найдено.
      </p>
    );
  }

  const deadlineState = getDeadlineState(assignment.deadline);
  const hasAnswer = text.trim().length > 0 || fileName !== null;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!hasAnswer) {
      setValidationError("Добавьте текст решения или выберите файл.");
      return;
    }
    setValidationError(null);
    submitMutation.mutate();
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div>
        <p className="text-sm text-ink-faint">Задание #{assignment.id}</p>
        <h1 className="mt-1 font-display text-3xl text-ink">{assignment.title}</h1>
        <p className="mt-3 max-w-prose leading-7 text-ink-soft">{assignment.description}</p>
      </div>

      <DeadlineNotice assignment={assignment} state={deadlineState} />

      {assignment.submission ? (
        <SubmittedBlock assignment={assignment} />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Отправить решение</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="solution-text" className="text-sm font-medium text-ink">
                  Текст решения
                </label>
                <textarea
                  id="solution-text"
                  rows={7}
                  placeholder="Опишите решение или добавьте комментарий к файлу"
                  className="w-full resize-y rounded border border-line bg-card px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine"
                  value={text}
                  onChange={(event) => {
                    setText(event.target.value);
                    setValidationError(null);
                  }}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="solution-file" className="text-sm font-medium text-ink">
                  Файл решения
                </label>
                <label
                  htmlFor="solution-file"
                  className="flex cursor-pointer items-center gap-2 rounded border border-dashed border-line px-3 py-4 text-sm text-ink-faint hover:border-pine hover:text-pine"
                >
                  <UploadCloud className="h-5 w-5" aria-hidden="true" />
                  <span className="truncate">{fileName ?? "Выберите файл"}</span>
                </label>
                <input
                  id="solution-file"
                  type="file"
                  className="sr-only"
                  onChange={(event) => {
                    setFileName(event.target.files?.[0]?.name ?? null);
                    setValidationError(null);
                  }}
                />
              </div>

              {validationError && <p className="text-sm text-danger" role="alert">{validationError}</p>}
              {submitMutation.isError && (
                <p className="text-sm text-danger" role="alert">
                  Не удалось отправить решение. Попробуйте ещё раз.
                </p>
              )}
              {submitMutation.isSuccess && (
                <p className="flex items-center gap-2 text-sm text-pine" role="status">
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> Решение отправлено на проверку.
                </p>
              )}

              <div>
                <Button type="submit" disabled={!hasAnswer || submitMutation.isPending}>
                  {submitMutation.isPending ? "Отправляем..." : "Отправить решение"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function DeadlineNotice({ assignment, state }: { assignment: MockAssignment; state: "past" | "soon" | "normal" }) {
  const styles = {
    past: "border-danger-50 bg-danger-50 text-danger",
    soon: "border-ochre-100 bg-ochre-50 text-ochre-600",
    normal: "border-line bg-card text-ink-soft",
  };
  const labels = {
    past: "Дедлайн прошёл",
    soon: "Дедлайн скоро",
    normal: "Дедлайн",
  };

  return (
    <div className={`flex items-start gap-3 rounded border p-4 text-sm ${styles[state]}`}>
      {state === "past" ? <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" /> : <Clock3 className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />}
      <div>
        <p className="font-medium">{labels[state]}</p>
        <p className="mt-1">{formatDeadline(assignment.deadline)} · максимум {assignment.maxScore} баллов</p>
      </div>
    </div>
  );
}

function SubmittedBlock({ assignment }: { assignment: MockAssignment }) {
  const submission = assignment.submission;
  if (!submission) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Задание проверено</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div className="flex items-baseline gap-2">
          <span className="font-display text-4xl text-pine">{submission.score}</span>
          <span className="text-sm text-ink-faint">/ {assignment.maxScore} баллов</span>
        </div>
        <div>
          <p className="text-sm font-medium text-ink">Комментарий ментора</p>
          <p className="mt-2 leading-7 text-ink-soft">{submission.comment}</p>
        </div>
      </CardContent>
    </Card>
  );
}
