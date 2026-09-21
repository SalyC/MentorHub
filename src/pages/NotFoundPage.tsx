import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/Button";

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <h1 className="font-display text-4xl text-ink">404</h1>
      <p className="max-w-prose text-ink-soft">
        Страница не найдена. Возможно, курс или задание были перемещены.
      </p>
      <Button asChild>
        <NavLink to="/">На главную</NavLink>
      </Button>
    </div>
  );
}
