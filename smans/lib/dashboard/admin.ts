// lib/dashboard/admin.ts
import { prisma } from "@/lib/prisma";

export async function getAdminStats(userId: string) {
  const [
    students,
    teachers,
    parents,
    classes,
    subjects,
    assignments,
    assessments,
    exams,
    feeItems,
    pendingInvoices,
    totalInvoices,
    totalPayments,
    presentAttendance,
    totalNotifications,
    unreadNotifications,
  ] = await Promise.all([
    prisma.student.count(),
    prisma.user.count({ where: { role: "TEACHER" } }),
    prisma.parent.count(),
    prisma.class.count(),
    prisma.subject.count(),
    prisma.assignment.count(),
    prisma.assessment.count(),
    prisma.exam.count(),
    prisma.feeItem.count(),
    prisma.invoice.count({ where: { status: "PENDING" } }),
    prisma.invoice.count(),
    prisma.payment.count(),
    prisma.attendance.count({
      where: {
        date: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
        status: "PRESENT",
      },
    }),
    prisma.notification.count({
      where: { userId },
    }),
    prisma.notification.count({
      where: { 
        userId,
        read: false,
      },
    }),
  ]);

  const totalAttendanceToday = await prisma.attendance.count({
    where: {
      date: {
        gte: new Date(new Date().setHours(0, 0, 0, 0)),
      },
    },
  });

  const recentParents = await prisma.parent.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          students: true,
        },
      },
    },
  });

  return {
    totalStudents: students,
    totalTeachers: teachers,
    totalParents: parents,
    totalClasses: classes,
    totalSubjects: subjects,
    totalAssignments: assignments,
    totalAssessments: assessments,
    totalExams: exams,
    totalFeeItems: feeItems,
    pendingInvoices: pendingInvoices,
    totalInvoices: totalInvoices,
    totalPayments: totalPayments,
    attendanceRate: totalAttendanceToday > 0 
      ? Math.round((presentAttendance / totalAttendanceToday) * 100) 
      : 0,
    totalNotifications: totalNotifications,
    unreadNotifications: unreadNotifications,
    recentParents: recentParents,
  };
}