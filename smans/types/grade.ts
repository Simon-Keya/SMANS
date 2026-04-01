// types/grade.ts
export interface GradeBase {
  id: string;
  marks: number;
  maxMarks: number;
  gradePoint?: number | null;
  remarks?: string | null;
  studentId: string;
  subjectId: string;
  examId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GradeWithRelations extends GradeBase {
  student: {
    id: string;
    name: string;
    rollNumber: string;
  };
  subject: {
    id: string;
    name: string;
    code: string;
  };
  exam: {
    id: string;
    name: string;
    date: Date;
    term: string;
  };
}