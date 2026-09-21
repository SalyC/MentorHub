import { useState } from "react";
import { Navigate } from "react-router-dom";
import { BookOpen, ShieldCheck, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { MOCK_COURSES } from "@/lib/mocks";
import { useAuthStore } from "@/store/authStore";
import type { UserRole } from "@/types";

type AdminTab = "users" | "courses";
type UserStatus = "active" | "blocked";

interface AdminUser {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
}

interface AdminCourse {
  id: string;
  title: string;
  mentor: string;
  studentsCount: number;
}

const INITIAL_USERS: AdminUser[] = [
  { id: "user-1", email: "anna@mentorhub.ru", role: "mentor", status: "active" },
  { id: "user-2", email: "mikhail@example.com", role: "student", status: "active" },
  { id: "user-3", email: "olga@example.com", role: "student", status: "blocked" },
  { id: "user-4", email: "admin@mentorhub.ru", role: "admin", status: "active" },
];

const INITIAL_COURSES: AdminCourse[] = MOCK_COURSES.map((course) => ({
  id: course.id,
  title: course.title,
  mentor: course.mentorName,
  studentsCount: course.studentsCount,
}));

const TABS: { id: AdminTab; label: string; icon: typeof Users }[] = [
  { id: "users", label: "Пользователи", icon: Users },
  { id: "courses", label: "Курсы", icon: BookOpen },
];

const ROLE_LABELS: Record<UserRole, string> = {
  student: "Студент",
  mentor: "Ментор",
  admin: "Администратор",
};

export function AdminPage() {
  const user = useAuthStore((state) => state.user);
  const [activeTab, setActiveTab] = useState<AdminTab>("users");
  const [users, setUsers] = useState<AdminUser[]>(INITIAL_USERS);
  const [courses, setCourses] = useState<AdminCourse[]>(INITIAL_COURSES);

  if (user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  function updateUserRole(userId: string, role: UserRole) {
    setUsers((currentUsers) =>
      currentUsers.map((item) => (item.id === userId ? { ...item, role } : item)),
    );
  }

  function toggleUserStatus(userId: string) {
    setUsers((currentUsers) =>
      currentUsers.map((item) =>
        item.id === userId
          ? { ...item, status: item.status === "active" ? "blocked" : "active" }
          : item,
      ),
    );
  }

  function removeCourse(courseId: string) {
    setCourses((currentCourses) => currentCourses.filter((course) => course.id !== courseId));
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-pine" aria-hidden="true" />
          <h1 className="font-display text-3xl text-ink">Админ-панель</h1>
        </div>
        <p className="mt-2 text-sm text-ink-soft">Управление пользователями и курсами MentorHub.</p>
      </div>

      <div className="flex gap-1 overflow-x-auto border-b border-line" role="tablist" aria-label="Разделы админ-панели">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex shrink-0 items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium",
                isActive ? "border-pine text-pine" : "border-transparent text-ink-faint hover:text-ink",
              )}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "users" ? (
        <UsersPanel users={users} onRoleChange={updateUserRole} onToggleStatus={toggleUserStatus} />
      ) : (
        <CoursesPanel courses={courses} onRemove={removeCourse} />
      )}
    </div>
  );
}

function UsersPanel({
  users,
  onRoleChange,
  onToggleStatus,
}: {
  users: AdminUser[];
  onRoleChange: (userId: string, role: UserRole) => void;
  onToggleStatus: (userId: string) => void;
}) {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line bg-muted text-xs uppercase tracking-wide text-ink-faint">
              <tr>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Роль</th>
                <th className="px-5 py-3 font-medium">Статус</th>
                <th className="px-5 py-3 text-right font-medium">Действие</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {users.map((item) => (
                <UserRow
                  key={item.id}
                  user={item}
                  onRoleChange={onRoleChange}
                  onToggleStatus={onToggleStatus}
                />
              ))}
            </tbody>
          </table>
        </div>

        <div className="divide-y divide-line md:hidden">
          {users.map((item) => (
            <UserCard
              key={item.id}
              user={item}
              onRoleChange={onRoleChange}
              onToggleStatus={onToggleStatus}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function UserRow({
  user,
  onRoleChange,
  onToggleStatus,
}: {
  user: AdminUser;
  onRoleChange: (userId: string, role: UserRole) => void;
  onToggleStatus: (userId: string) => void;
}) {
  return (
    <tr>
      <td className="px-5 py-4 font-medium text-ink">{user.email}</td>
      <td className="px-5 py-4"><RoleSelect user={user} onRoleChange={onRoleChange} /></td>
      <td className="px-5 py-4"><StatusLabel status={user.status} /></td>
      <td className="px-5 py-4 text-right"><StatusButton user={user} onToggleStatus={onToggleStatus} /></td>
    </tr>
  );
}

function UserCard({
  user,
  onRoleChange,
  onToggleStatus,
}: {
  user: AdminUser;
  onRoleChange: (userId: string, role: UserRole) => void;
  onToggleStatus: (userId: string) => void;
}) {
  return (
    <div className="flex flex-col gap-4 p-5">
      <div>
        <p className="break-all font-medium text-ink">{user.email}</p>
        <div className="mt-2"><StatusLabel status={user.status} /></div>
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor={`role-${user.id}`} className="text-xs font-medium text-ink-faint">Роль</label>
        <RoleSelect user={user} onRoleChange={onRoleChange} />
      </div>
      <StatusButton user={user} onToggleStatus={onToggleStatus} />
    </div>
  );
}

function RoleSelect({ user, onRoleChange }: { user: AdminUser; onRoleChange: (userId: string, role: UserRole) => void }) {
  return (
    <select
      id={`role-${user.id}`}
      value={user.role}
      aria-label={`Роль пользователя ${user.email}`}
      onChange={(event) => onRoleChange(user.id, event.target.value as UserRole)}
      className="h-9 rounded border border-line bg-card px-2 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine"
    >
      {Object.entries(ROLE_LABELS).map(([value, label]) => (
        <option key={value} value={value}>{label}</option>
      ))}
    </select>
  );
}

function StatusLabel({ status }: { status: UserStatus }) {
  return (
    <span className={cn(
      "inline-flex rounded px-2 py-1 text-xs font-medium",
      status === "active" ? "bg-pine-50 text-pine" : "bg-danger-50 text-danger",
    )}>
      {status === "active" ? "Активен" : "Заблокирован"}
    </span>
  );
}

function StatusButton({ user, onToggleStatus }: { user: AdminUser; onToggleStatus: (userId: string) => void }) {
  return (
    <Button type="button" variant="outline" size="sm" onClick={() => onToggleStatus(user.id)}>
      {user.status === "active" ? "Заблокировать" : "Разблокировать"}
    </Button>
  );
}

function CoursesPanel({ courses, onRemove }: { courses: AdminCourse[]; onRemove: (courseId: string) => void }) {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line bg-muted text-xs uppercase tracking-wide text-ink-faint">
              <tr>
                <th className="px-5 py-3 font-medium">Название</th>
                <th className="px-5 py-3 font-medium">Ментор</th>
                <th className="px-5 py-3 font-medium">Студенты</th>
                <th className="px-5 py-3 text-right font-medium">Действие</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {courses.map((course) => (
                <CourseRow key={course.id} course={course} onRemove={onRemove} />
              ))}
            </tbody>
          </table>
        </div>

        <div className="divide-y divide-line md:hidden">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} onRemove={onRemove} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function CourseRow({ course, onRemove }: { course: AdminCourse; onRemove: (courseId: string) => void }) {
  return (
    <tr>
      <td className="px-5 py-4 font-medium text-ink">{course.title}</td>
      <td className="px-5 py-4 text-ink-soft">{course.mentor}</td>
      <td className="px-5 py-4 text-ink-soft">{course.studentsCount}</td>
      <td className="px-5 py-4 text-right"><RemoveButton course={course} onRemove={onRemove} /></td>
    </tr>
  );
}

function CourseCard({ course, onRemove }: { course: AdminCourse; onRemove: (courseId: string) => void }) {
  return (
    <div className="flex items-center justify-between gap-4 p-5">
      <div className="min-w-0">
        <p className="font-medium text-ink">{course.title}</p>
        <p className="mt-1 text-sm text-ink-soft">{course.mentor} · {course.studentsCount} студентов</p>
      </div>
      <RemoveButton course={course} onRemove={onRemove} />
    </div>
  );
}

function RemoveButton({ course, onRemove }: { course: AdminCourse; onRemove: (courseId: string) => void }) {
  return (
    <Button type="button" variant="destructive" size="sm" onClick={() => onRemove(course.id)}>
      Удалить
    </Button>
  );
}
