// types/teacher.ts
export interface TeacherBase {
    id: string;
    name: string;
    email: string;
    staffNo: string | null;
    phone: string | null;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface TeacherWithRelations extends TeacherBase {
    teacherClasses: Array<{ id: string; name: string; level: string }>;
  }