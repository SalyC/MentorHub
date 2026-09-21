export type UserRole = "student" | "mentor" | "admin";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  telegramLinked: boolean;
}

export interface AuthTokens {
  accessToken: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  mentorId: string;
  mentorName: string;
  coverUrl?: string;
  enrolled: boolean;
  modulesCount: number;
}

export interface CourseModule {
  id: string;
  courseId: string;
  title: string;
  materials: Material[];
}

export type MaterialType = "text" | "file" | "link";

export interface Material {
  id: string;
  type: MaterialType;
  title: string;
  content: string;
}

export type AssignmentStatus = "not_submitted" | "submitted" | "graded";

export interface Assignment {
  id: string;
  courseId: string;
  title: string;
  description: string;
  status: AssignmentStatus;
  grade?: number;
  dueDate?: string;
}

export interface Submission {
  id: string;
  assignmentId: string;
  text?: string;
  fileUrl?: string;
  submittedAt: string;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  courseId: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: string;
}
