// types/user.ts
export type Role = 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT';

export interface UserBase {
  id: string;
  name: string | null;
  email: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserWithRelations extends UserBase {
  teacherClasses?: Array<{ id: string; name: string }>;
  student?: { id: string; name: string; rollNumber: string } | null;
  parent?: { id: string; name: string; phone: string | null } | null;
}