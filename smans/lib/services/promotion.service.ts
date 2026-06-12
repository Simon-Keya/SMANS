// lib/services/promotion.service.ts
import { prisma } from "@/lib/prisma";

export class PromotionService {
  /**
   * Promote a student from one class to another and create a log entry
   */
  static async promoteStudent(
    studentId: string,
    fromClassId: string,
    toClassId: string,
    approvedBy?: string
  ) {
    return prisma.$transaction(async (tx) => {
      // Verify current class
      const student = await tx.student.findUnique({
        where: { id: studentId },
        include: { 
          class: true,
          parent: { select: { name: true } }
        },
      });

      if (!student) throw new Error("Student not found");

      if (student.classId !== fromClassId) {
        throw new Error(`Student is not currently in the specified class. Current class: ${student.class?.name}`);
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
        include: { 
          class: true,
          parent: { select: { name: true, phone: true } }
        },
      });

      // Create promotion log (using fromClass and toClass as strings)
      const log = await tx.promotionLog.create({
        data: {
          studentId,
          fromClass: student.class?.name || "Unknown",
          toClass: targetClass.name,
          date: new Date(),
          approvedBy: approvedBy || null,
        },
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          userId: approvedBy,
          action: "PROMOTE_STUDENT",
          entity: "Student",
          entityId: studentId,
          metadata: {
            studentName: student.name,
            admissionNumber: student.admissionNumber,
            fromClass: student.class?.name,
            toClass: targetClass.name,
            fromClassId,
            toClassId,
          },
        },
      });

      return {
        student: updatedStudent,
        promotionLog: log,
      };
    });
  }

  /**
   * Promote multiple students from one class to another
   */
  static async promoteClass(
    fromClassId: string,
    toClassId: string,
    studentIds?: string[],
    approvedBy?: string
  ) {
    return prisma.$transaction(async (tx) => {
      // Get students to promote
      const where: any = { classId: fromClassId };
      if (studentIds && studentIds.length > 0) {
        where.id = { in: studentIds };
      }

      const students = await tx.student.findMany({
        where,
        include: { class: true },
      });

      if (students.length === 0) {
        throw new Error("No students found to promote");
      }

      // Verify target class exists
      const targetClass = await tx.class.findUnique({
        where: { id: toClassId },
      });

      if (!targetClass) throw new Error("Target class not found");

      // Update all students' class
      const updatedStudents = await tx.student.updateMany({
        where: { id: { in: students.map(s => s.id) } },
        data: { classId: toClassId },
      });

      // Create promotion logs for each student
      const logs = await Promise.all(
        students.map(student =>
          tx.promotionLog.create({
            data: {
              studentId: student.id,
              fromClass: student.class?.name || "Unknown",
              toClass: targetClass.name,
              date: new Date(),
              approvedBy: approvedBy || null,
            },
          })
        )
      );

      // Create audit log for batch promotion
      await tx.auditLog.create({
        data: {
          userId: approvedBy,
          action: "PROMOTE_CLASS",
          entity: "Class",
          entityId: fromClassId,
          metadata: {
            studentCount: students.length,
            fromClass: students[0]?.class?.name,
            toClass: targetClass.name,
            studentIds: students.map(s => s.id),
          },
        },
      });

      return {
        promotedCount: updatedStudents.count,
        logs,
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
        student: { 
          select: { 
            name: true, 
            admissionNumber: true,  // Changed from rollNumber
            class: { select: { name: true } }
          } 
        },
      },
    });
  }

  /**
   * Get promotion history for a specific student with full details
   */
  static async getStudentPromotionDetails(studentId: string) {
    const promotions = await this.getStudentHistory(studentId);
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: {
        id: true,
        name: true,
        admissionNumber: true,
        class: { select: { name: true, level: true } },
      },
    });

    return {
      student,
      promotions,
      currentClass: student?.class,
    };
  }

  /**
   * Get all promotions (admin view)
   */
  static async getAllPromotions(limit?: number) {
    return prisma.promotionLog.findMany({
      orderBy: { date: "desc" },
      include: {
        student: { 
          select: { 
            name: true, 
            admissionNumber: true,  // Changed from rollNumber
            class: { select: { name: true } }
          } 
        },
      },
      take: limit || 100,
    });
  }

  /**
   * Get promotions by class
   */
  static async getPromotionsByClass(className: string) {
    return prisma.promotionLog.findMany({
      where: {
        OR: [
          { fromClass: className },
          { toClass: className },
        ],
      },
      orderBy: { date: "desc" },
      include: {
        student: { 
          select: { 
            name: true, 
            admissionNumber: true,
            class: { select: { name: true } }
          } 
        },
      },
    });
  }

  /**
   * Get promotions by date range
   */
  static async getPromotionsByDateRange(startDate: Date, endDate: Date) {
    return prisma.promotionLog.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: "desc" },
      include: {
        student: { 
          select: { 
            name: true, 
            admissionNumber: true,
            class: { select: { name: true } }
          } 
        },
      },
    });
  }

  /**
   * Get promotion statistics
   */
  static async getPromotionStats() {
    const totalPromotions = await prisma.promotionLog.count();
    
    const promotionsByMonth = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', date) as month,
        COUNT(*) as count
      FROM promotion_logs
      GROUP BY DATE_TRUNC('month', date)
      ORDER BY month DESC
      LIMIT 12
    `;

    const mostPromotedFrom = await prisma.promotionLog.groupBy({
      by: ['fromClass'],
      _count: { fromClass: true },
      orderBy: { _count: { fromClass: 'desc' } },
      take: 5,
    });

    const mostPromotedTo = await prisma.promotionLog.groupBy({
      by: ['toClass'],
      _count: { toClass: true },
      orderBy: { _count: { toClass: 'desc' } },
      take: 5,
    });

    return {
      totalPromotions,
      promotionsByMonth,
      mostPromotedFrom: mostPromotedFrom.map(item => ({
        className: item.fromClass,
        count: item._count.fromClass,
      })),
      mostPromotedTo: mostPromotedTo.map(item => ({
        className: item.toClass,
        count: item._count.toClass,
      })),
    };
  }

  /**
   * Check if a student has been promoted in a given time period
   */
  static async checkRecentPromotion(studentId: string, days: number = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const recentPromotion = await prisma.promotionLog.findFirst({
      where: {
        studentId,
        date: { gte: cutoffDate },
      },
      orderBy: { date: 'desc' },
    });

    return {
      hasRecentPromotion: !!recentPromotion,
      promotion: recentPromotion,
      daysSincePromotion: recentPromotion 
        ? Math.floor((Date.now() - recentPromotion.date.getTime()) / (1000 * 60 * 60 * 24))
        : null,
    };
  }

  /**
   * Reverse a promotion (demote student back to previous class)
   */
  static async demoteStudent(promotionLogId: string, approvedBy?: string) {
    return prisma.$transaction(async (tx) => {
      const promotionLog = await tx.promotionLog.findUnique({
        where: { id: promotionLogId },
      });

      if (!promotionLog) throw new Error("Promotion log not found");

      // Get the original class name to find its ID
      const originalClass = await tx.class.findFirst({
        where: { name: promotionLog.fromClass },
      });

      if (!originalClass) throw new Error("Original class not found");

      // Update student back to original class
      const updatedStudent = await tx.student.update({
        where: { id: promotionLog.studentId },
        data: { classId: originalClass.id },
      });

      // Create a reversal log (optional)
      await tx.auditLog.create({
        data: {
          userId: approvedBy,
          action: "DEMOTE_STUDENT",
          entity: "Student",
          entityId: promotionLog.studentId,
          metadata: {
            originalPromotionId: promotionLogId,
            fromClass: promotionLog.toClass,
            toClass: promotionLog.fromClass,
          },
        },
      });

      return updatedStudent;
    });
  }
}