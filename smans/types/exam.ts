// types/exam.ts
export interface ExamBase {
    id: string;
    name: string;                    // e.g., "End of Term 1 Assessment", "Mid-Term CBC Check"
    term: 'Term 1' | 'Term 2' | 'Term 3';
    year: number;
    assessmentDate: Date;
    learningAreaId?: string | null;  // Can be linked to specific Learning Area
    maxScore?: number;
    isCBCAssessment: boolean;        // True for competency-based assessments
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface ExamWithRelations extends ExamBase {
    learningArea?: {
      id: string;
      name: string;
    } | null;
  }