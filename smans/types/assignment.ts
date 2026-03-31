// types/assignment.ts
export interface AssignmentBase {
  id: string;
  title: string;
  description?: string | null;
  subjectId: string;
  classId: string;
  dueDate: Date;
  maxMarks: number;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AssignmentWithRelations extends AssignmentBase {
  subject: {
    id: string;
    name: string;
    code: string;
  };
  class: {
    id: string;
    name: string;
  };
  createdBy: {
    id: string;
    name: string;
  };
  submissions?: Array<{
    id: string;
    studentId: string;
    marks?: number | null;
    submittedAt: Date;
  }>;
}