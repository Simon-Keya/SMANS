// types/class.ts
export interface ClassBase {
    id: string;
    name: string;
    level: string;
    teacherId: string | null;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface ClassWithRelations extends ClassBase {
    teacher: { name: string; email: string } | null;
    _count?: { students: number };
  }