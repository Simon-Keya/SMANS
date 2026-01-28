"use server";

import { prisma } from "@/lib/prisma";

export async function updateAttendance(
  attendanceId: string,
  present: boolean
) {
  return prisma.attendance.update({
    where: { id: attendanceId },
    data: { present },
  });
}
