// types/attendance.ts
export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE';

export interface AttendanceRecord {
  id: string;
  date: Date;
  status: AttendanceStatus;
  studentId: string;
  classId: string;
  createdAt: Date;
  updatedAt: Date;
}