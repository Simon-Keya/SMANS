// types/student.ts
export interface StudentBase {
    id: string;
    name: string;
    rollNumber: string;
    email: string | null;
    phone: string | null;
    classId: string;
    parentId: string | null;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface StudentWithRelations extends StudentBase {
    class: { name: string; level: string };
    parent: { name: string; phone: string | null } | null;
  }