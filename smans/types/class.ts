// types/class.ts
export interface ClassBase {
  id: string;
  name: string;
  level?: string;
  capacity?: number;
  academicYear?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClassWithRelations extends ClassBase {
  students: Array<{
    id: string;
    name: string;
    rollNumber: string;
  }>;
  teacher?: {
    id: string;
    name: string;
  } | null;
  subjects?: Array<{
    id: string;
    name: string;
    code: string;
  }>;
}