// types/user.ts
import type { ParentBase } from './parent';
import type { Role } from './role';
import type { StudentBase } from './student';
import type { TeacherBase } from './teacher';

export interface UserBase {
  id: string;
  name: string | null;
  email: string;
  role: Role;
  isActive: boolean;
  phone?: string | null;
  image?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserWithRelations extends UserBase {
  teacher?: TeacherBase | null;
  student?: StudentBase | null;
  parent?: ParentBase | null;
}