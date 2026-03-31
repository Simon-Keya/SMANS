// types/assessment.ts
export type PerformanceLevel = 'Exceeding' | 'Meeting' | 'Approaching' | 'Below';

export interface AssessmentBase {
  id: string;
  studentId: string;
  learningAreaId: string;
  assessmentDate: Date;
  performanceLevel: PerformanceLevel;
  score?: number;                    // Optional numerical score
  remarks?: string | null;
  teacherId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AssessmentWithRelations extends AssessmentBase {
  student: { name: string; rollNumber: string };
  learningArea: { name: string };
  teacher: { name: string };
}