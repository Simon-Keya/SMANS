// types/teacher.ts
import type { Role } from './role'; // ← Add this import

export interface TeacherBase {
  id: string;
  name: string;
  email: string;
  staffNo: string | null;
  phone: string | null;
  subjectSpecialization?: string | null;
  qualification?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TeacherWithRelations extends TeacherBase {
  user?: {
    id: string;
    email: string;
    role: Role;                    // ← Now correctly typed
  };

  teacherClasses: Array<{
    id: string;
    name: string;
    level?: string;
    capacity?: number;
  }>;

  subjects?: Array<{
    id: string;
    name: string;
    code: string;
  }>;
}