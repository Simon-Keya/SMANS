// types/student.ts
export interface StudentBase {
  id: string;
  name: string;
  rollNumber: string;
  dateOfBirth?: Date | null;
  gender?: 'MALE' | 'FEMALE';
  gradeLevel: string;                    // e.g., "Grade 4", "PP2"
  status: 'ACTIVE' | 'GRADUATED' | 'LEFT';
  admissionNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudentWithRelations extends StudentBase {
  currentClass?: {
    id: string;
    name: string;
    level: string;
  } | null;

  parent?: {
    id: string;
    name: string;
    phone: string | null;
  } | null;

  // CBC specific
  coreCompetencies?: Array<{
    competency: string;
    level: 'Exceeding' | 'Meeting' | 'Approaching' | 'Below';
  }>;
}