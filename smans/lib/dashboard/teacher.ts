// lib/dashboard/teacher.ts
import { prisma } from "@/lib/prisma";

export async function getTeacherStats(userId: string) {
  const teacherClasses = await prisma.class.findMany({
    where: { teacherId: userId },
    include: {
      _count: {
        select: {
          students: true,
          assignments: true,
          assessments: true,
        },
      },
    },
  });
  
  const totalStudents = teacherClasses.reduce((acc, cls) => acc + cls._count.students, 0);
  const totalAssignments = teacherClasses.reduce((acc, cls) => acc + cls._count.assignments, 0);
  const totalAssessments = teacherClasses.reduce((acc, cls) => acc + cls._count.assessments, 0);
  
  const [teacherNotifications, teacherUnread] = await Promise.all([
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
  
  return {
    teacherClasses: teacherClasses.length,
    totalStudents,
    totalAssignments,
    totalAssessments,
    classes: teacherClasses,
    totalNotifications: teacherNotifications,
    unreadNotifications: teacherUnread,
  };
}