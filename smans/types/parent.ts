// types/parent.ts
export interface ParentBase {
    id: string;
    name: string;
    phone: string | null;
    address?: string | null;
    occupation?: string | null;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface ParentWithRelations extends ParentBase {
    user?: {
      id: string;
      email: string;
    };
    students: Array<{
      id: string;
      name: string;
      rollNumber: string;
      currentClass?: { name: string };
    }>;
  }