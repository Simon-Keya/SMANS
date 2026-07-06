// lib/dashboard/student.ts
import { prisma } from "@/lib/prisma";

export async function getStudentStats(userId: string) {
  const student = await prisma.student.findFirst({
    where: { userId },
    include: {
      class: {
        include: {
          subjects: true,
        },
      },
      grades: {
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { 
          subject: true,
          exam: true,
        },
      },
      attendance: {
        where: {
          date: {
            gte: new Date(new Date().setDate(new Date().getDate() - 30)),
          },
        },
        orderBy: { date: "desc" },
        take: 10,
      },
      invoices: {
        where: {
          status: {
            in: ["PENDING", "PARTIAL", "OVERDUE"],
          },
        },
        orderBy: { dueDate: "asc" },
      },
    },
  });

  const [studentNotifications, studentUnread] = await Promise.all([
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

  let attendanceRate = 0;
  if (student?.attendance && student.attendance.length > 0) {
    const presentCount = student.attendance.filter(a => a.status === "PRESENT").length;
    attendanceRate = Math.round((presentCount / student.attendance.length) * 100);
  }

  return {
    student,
    attendanceRate,
    pendingInvoices: student?.invoices?.length || 0,
    totalNotifications: studentNotifications,
    unreadNotifications: studentUnread,
  };
}