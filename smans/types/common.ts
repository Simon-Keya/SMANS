// types/common.ts
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export type PerformanceLevel = 'Exceeding Expectations' | 'Meeting Expectations' | 'Approaching Expectations' | 'Below Expectations';

export interface SelectOption {
  value: string;
  label: string;
}

export type AcademicTerm = 'Term 1' | 'Term 2' | 'Term 3';

export interface DateRange {
  from: Date;
  to: Date;
}