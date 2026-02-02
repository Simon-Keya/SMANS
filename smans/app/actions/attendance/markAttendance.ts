"use server";

import { prisma } from "@/lib/prisma";

export async function markAttendance(
  date: Date,
  records: {
    studentId: string;
    classId: string;      // ← required: add this
    present: boolean;
  }[]
) {
  return prisma.$transaction(
    records.map(r => 
      prisma.attendance.upsert({
        where: {
          studentId_date: {
            studentId: r.studentId,
            date,
          },
        },
        update: {
          status: r.present ? "PRESENT" : "ABSENT",  // ← use enum, not boolean
        },
        create: {
          studentId: r.studentId,
          classId: r.classId,                        // ← required field
          date,
          status: r.present ? "PRESENT" : "ABSENT",
        },
      })
    )
  );
}