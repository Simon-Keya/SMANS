// types/learningArea.ts
export interface LearningAreaBase {
    id: string;
    name: string;                    // e.g., "Mathematics Activities", "Literacy Activities"
    code?: string;
    strand?: string;                 // CBC strand
    subStrand?: string;
    description?: string | null;
    createdAt: Date;
    updatedAt: Date;
  }