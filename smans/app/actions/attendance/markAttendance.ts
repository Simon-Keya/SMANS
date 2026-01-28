"use server";

import { prisma } from "@/lib/prisma";

export async function markAttendance(
  date: Date,
  records: { studentId: string; present: boolean }[]
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
        update: { present: r.present },
        create: { ...r, date },
      })
    )
  );
}
