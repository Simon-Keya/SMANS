"use server";

import { prisma } from "@/lib/prisma";

export async function generateAttendanceReport(classId: string) {
  return prisma.attendance.findMany({
    where: { student: { classId } },
    include: { student: true },
  });
}
