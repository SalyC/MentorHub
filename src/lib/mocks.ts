export interface MockCourse {
  id: string;
  title: string;
  description: string;
  coverUrl: string;
  mentorName: string;
  studentsCount: number;
  isEnrolled: boolean;
}

export interface MockModule {
  id: string;
  title: string;
  description: string;
}

export interface MockAssignment {
  id: string;
  title: string;
  description: string;
  deadline: string;
  maxScore: number;
  submission?: {
    score: number;
    comment: string;
  };
}

export const MOCK_COURSES: MockCourse[] = [
  {
    id: "react-typescript",
    title: "Основы React и TypeScript",
    description: "Соберите крепкую базу для разработки интерфейсов: компоненты, состояние, типы и практические паттерны.",
    coverUrl: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=900&q=80",
    mentorName: "Анна Ковалёва",
    studentsCount: 128,
    isEnrolled: true,
  },
  {
    id: "rest-api",
    title: "Архитектура REST API",
    description: "Проектируйте понятные и надежные API: слои приложения, авторизация, версии и контракты.",
    coverUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=900&q=80",
    mentorName: "Игорь Панин",
    studentsCount: 94,
    isEnrolled: false,
  },
  {
    id: "websocket",
    title: "WebSocket в реальных приложениях",
    description: "Создавайте чаты и живые уведомления с устойчивыми соединениями и корректным переподключением.",
    coverUrl: "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=900&q=80",
    mentorName: "Анна Ковалёва",
    studentsCount: 76,
    isEnrolled: false,
  },
  {
    id: "product-design",
    title: "Продуктовый дизайн",
    description: "Пройдите путь от пользовательской проблемы до проверенного прототипа и ясной дизайн-системы.",
    coverUrl: "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=900&q=80",
    mentorName: "Мария Власова",
    studentsCount: 61,
    isEnrolled: false,
  },
  {
    id: "python-data",
    title: "Python для анализа данных",
    description: "Работайте с данными уверенно: очистка, визуализация, исследование и первые модели.",
    coverUrl: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=900&q=80",
    mentorName: "Дмитрий Орлов",
    studentsCount: 113,
    isEnrolled: false,
  },
  {
    id: "career-start",
    title: "Старт карьеры в IT",
    description: "Составьте план развития, подготовьте портфолио и научитесь уверенно проходить технические интервью.",
    coverUrl: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=900&q=80",
    mentorName: "Елена Соколова",
    studentsCount: 87,
    isEnrolled: false,
  },
];

export const MOCK_MODULES: MockModule[] = [
  { id: "module-1", title: "Старт и настройка проекта", description: "Инструменты, структура проекта и рабочий процесс." },
  { id: "module-2", title: "Ключевые концепции", description: "Разберем основные идеи курса на понятных примерах." },
  { id: "module-3", title: "Практика в проекте", description: "Закрепим материал в задаче, близкой к реальной работе." },
  { id: "module-4", title: "Итоговый проект", description: "Соберем результат и подготовим его к презентации." },
];

export const MOCK_ASSIGNMENTS: MockAssignment[] = [
  {
    id: "a1",
    title: "Настройка проекта",
    description: "Создайте новый проект, настройте TypeScript и добавьте базовую структуру приложения.",
    deadline: "2026-09-10T18:00:00+03:00",
    maxScore: 10,
    submission: {
      score: 9,
      comment: "Хорошая структура проекта. Обратите внимание на именование общих компонентов.",
    },
  },
  {
    id: "a2",
    title: "Компонент авторизации",
    description: "Соберите форму входа и регистрации с валидацией полей и понятными состояниями ошибок.",
    deadline: "2026-09-13T18:00:00+03:00",
    maxScore: 20,
  },
  {
    id: "a3",
    title: "Интеграция с API",
    description: "Подключите экран курса к API и обработайте состояния загрузки, ошибки и пустого результата.",
    deadline: "2026-09-20T18:00:00+03:00",
    maxScore: 20,
  },
];

const MOCK_DELAY = 300;

function wait(): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, MOCK_DELAY));
}

export async function fetchMockCourses(): Promise<MockCourse[]> {
  await wait();
  return MOCK_COURSES;
}

export async function fetchMockCourse(id: string): Promise<MockCourse> {
  await wait();
  const course = MOCK_COURSES.find((item) => item.id === id);
  if (!course) throw new Error("Курс не найден");
  return course;
}

export async function enrollMockCourse(id: string): Promise<MockCourse> {
  await wait();
  const course = MOCK_COURSES.find((item) => item.id === id);
  if (!course) throw new Error("Курс не найден");
  course.isEnrolled = true;
  return { ...course };
}

export async function submitMockAssignment(
  id: string,
  _text: string,
  _fileName: string | null,
): Promise<MockAssignment> {
  await wait();
  const assignment = MOCK_ASSIGNMENTS.find((item) => item.id === id);
  if (!assignment) throw new Error("Задание не найдено");
  return assignment;
}
