// types/subject.ts
export interface SubjectBase {
    id: string;
    name: string;
    code: string;
    description?: string | null;
    credits?: number;
    createdAt: Date;
    updatedAt: Date;
  }