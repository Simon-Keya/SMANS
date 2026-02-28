// types/assignment.ts
export interface AssignmentBase {
    id: string;
    title: string;
    description: string | null;
    dueDate: Date;
    classId: string;
    subjectId: string;
    createdBy: string | null;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface AssignmentWithRelations extends AssignmentBase {
    class: { id: string; name: string };
    subject: { id: string; name: string; code: string };
    createdByUser: { id: string; name: string } | null;
  }