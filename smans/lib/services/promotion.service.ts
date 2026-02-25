// lib/services/promotion.service.ts
import { prisma } from "@/lib/prisma";

export class PromotionService {
  /**
   * Promote a student from one class to another and create a log entry
   */
  static async promoteStudent(
    studentId: string,
    fromClassId: string,
    toClassId: string
  ) {
    return prisma.$transaction(async (tx) => {
      // Verify current class
      const student = await tx.student.findUnique({
        where: { id: studentId },
        include: { class: true },
      });

      if (!student) throw new Error("Student not found");

      if (student.classId !== fromClassId) {
        throw new Error("Student is not currently in the specified class");
      }

      // Verify target class exists
      const targetClass = await tx.class.findUnique({
        where: { id: toClassId },
      });

      if (!targetClass) throw new Error("Target class not found");

      // Update student's class
      const updatedStudent = await tx.student.update({
        where: { id: studentId },
        data: { classId: toClassId },
        include: { class: true },
      });

      // Create promotion log
      const log = await tx.promotionLog.create({
        data: {
          studentId,
          fromClass: student.class.name,
          toClass: targetClass.name,
          date: new Date(),
        },
      });

      return {
        student: updatedStudent,
        promotionLog: log,
      };
    });
  }

  /**
   * Get promotion history for a specific student
   */
  static async getStudentHistory(studentId: string) {
    return prisma.promotionLog.findMany({
      where: { studentId },
      orderBy: { date: "desc" },
      include: {
        student: { select: { name: true, rollNumber: true } },
      },
    });
  }

  /**
   * Get all promotions (admin view)
   */
  static async getAllPromotions() {
    return prisma.promotionLog.findMany({
      orderBy: { date: "desc" },
      include: {
        student: { select: { name: true, rollNumber: true } },
      },
    });
  }
}