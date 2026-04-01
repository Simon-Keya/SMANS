// types/class.ts
export interface ClassBase {
  id: string;
  name: string;                    // e.g., "Grade 4A"
  gradeLevel: string;              // "PP1", "PP2", "Grade 1", ..., "Grade 6"
  capacity?: number;
  academicYear: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClassWithRelations extends ClassBase {
  studentsCount: number;
  teacher?: {
    id: string;
    name: string;
  } | null;
}