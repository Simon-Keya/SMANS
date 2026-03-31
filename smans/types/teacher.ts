// types/teacher.ts
import type { Role } from './role';

export interface TeacherBase {
  id: string;
  name: string;
  email: string;
  staffNo: string | null;
  phone: string | null;
  tscNumber?: string | null;               // Kenya-specific
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TeacherWithRelations extends TeacherBase {
  user?: {
    id: string;
    email: string;
    role: Role;
  };

  learningAreas: Array<{
    id: string;
    name: string;           // e.g., "Mathematics Activities", "Environmental Activities"
  }>;

  assignedClasses: Array<{
    id: string;
    name: string;
    gradeLevel: string;
  }>;
}