// types/grade.ts
export interface GradeBase {
    id: string;
    marks: number;
    maxMarks: number;
    studentId: string;
    subjectId: string;
    examId: string;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface GradeWithRelations extends GradeBase {
    student: { name: string; rollNumber: string };
    subject: { name: string; code: string };
    exam: { name: string; date: Date };
  }