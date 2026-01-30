"use server";

import { prisma } from "@/lib/prisma";

export async function updateAttendance(
  attendanceId: string,
  isPresent: boolean   // ← rename for clarity (true = present, false = absent)
) {
  // Map boolean → enum value
  const newStatus = isPresent ? "PRESENT" : "ABSENT";

  return prisma.attendance.update({
    where: { id: attendanceId },
    data: { 
      status: newStatus 
    },
  });
}