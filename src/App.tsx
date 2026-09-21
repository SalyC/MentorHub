import { Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { HomePage } from "@/pages/HomePage";
import { LoginPage } from "@/pages/LoginPage";
import { RegisterPage } from "@/pages/RegisterPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { CoursePage } from "@/pages/CoursePage";
import { AssignmentPage } from "@/pages/AssignmentPage";
import { AdminPage } from "@/pages/AdminPage";
import { MentorPage } from "@/pages/MentorPage";
import { ChatPage } from "@/pages/ChatPage";
import { NotFoundPage } from "@/pages/NotFoundPage";

export function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/courses/:id" element={<CoursePage />} />

        {/* Requires authentication, any role */}
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/assignments/:id" element={<AssignmentPage />} />
          <Route path="/chat/:courseId" element={<ChatPage />} />
        </Route>

        {/* Requires the mentor role */}
        <Route element={<ProtectedRoute allowedRoles={["mentor"]} />}>
          <Route path="/mentor" element={<MentorPage />} />
        </Route>

        {/* Requires the admin role */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/admin" element={<AdminPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
