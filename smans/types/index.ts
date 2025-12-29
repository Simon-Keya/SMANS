// types/index.ts
export type Role = "admin" | "teacher" | "student" | "parent";

export interface Student {
  id: string;
  name: string;
  rollNumber: string;
  class: string;
  email?: string;
  phone?: string;
  parentName?: string;
  parentPhone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string;
  present: boolean;
  student: {
    name: string;
    rollNumber: string;
  };
}

export interface Grade {
  id: string;
  studentId: string;
  examName: string;
  subject: string;
  marks: number;
  maxMarks: number;
}

export interface TimetablePeriod {
  id: string;
  class: string;
  day: string;
  time: string;
  subject: string;
  teacher?: string;
  room?: string;
}