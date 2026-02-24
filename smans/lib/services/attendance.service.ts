import { prisma } from "@/lib/db/prisma";
import { attendanceSchema } from "@/lib/validators/attendance.schema";
import { z } from "zod";

export class AttendanceService {
  static async markBulk(date: Date, records: z.infer<typeof attendanceSchema>[]) {
    return prisma.$transaction(
      records.map(r =>
        prisma.attendance.upsert({
          where: {
            studentId_date: {
              studentId: r.studentId,
              date,
            },
          },
          update: { status: r.status },
          create: {
            studentId: r.studentId,
            classId: r.classId,
            date,
            status: r.status,
          },
        })
      )
    );
  }

  static async getDaily(date: Date) {
    return prisma.attendance.findMany({
      where: { date },
      include: {
        student: { select: { name: true, rollNumber: true } },
        class: { select: { name: true } },
      },
      orderBy: { student: { name: "asc" } },
    });
  }
}