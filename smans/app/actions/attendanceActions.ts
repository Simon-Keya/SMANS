"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function markAttendance(records: {
  studentId: string;
  date: string;
  present: boolean;
}[]) {
  const attendanceData = records.map((record) => ({
    studentId: record.studentId,
    date: new Date(record.date),
    present: record.present,
  }));

  await prisma.attendance.createMany({
    data: attendanceData,
    skipDuplicates: true, // Prevents duplicate entries for same student + date
  });

  revalidatePath("/dashboard/attendance");
  revalidatePath("/dashboard/attendance/report");
}