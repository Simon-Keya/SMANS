// types/student.ts
export interface StudentBase {
  id: string;
  name: string;
  rollNumber: string;
  dateOfBirth?: Date | null;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  status: 'ACTIVE' | 'GRADUATED' | 'LEFT' | 'SUSPENDED';
  promotionDate?: Date | null;
  graduationDate?: Date | null;
  currentClassId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudentWithRelations extends StudentBase {
  user?: {
    id: string;
    email: string;
  };
  currentClass?: {
    id: string;
    name: string;
    level?: string;
  } | null;
  grades?: Array<{
    id: string;
    marks: number;
    subject: { name: string; code: string };
  }>;
  parent?: {
    id: string;
    name: string;
    phone: string | null;
  } | null;
}