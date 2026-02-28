// app/api/reports/grades/route.ts
import { authOptions } from "@/lib/auth/auth"; // FIXED: correct import path
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Overall average (all time - no createdAt filter)
    const allGrades = await prisma.grade.findMany({
      select: { marks: true, maxMarks: true },
      take: 100, // limit for performance (adjust if needed)
    });

    const totalMarks = allGrades.reduce((sum, g) => sum + g.marks, 0);
    const totalMax = allGrades.reduce((sum, g) => sum + g.maxMarks, 0);
    const overallAvg = totalMax > 0 ? Math.round((totalMarks / totalMax) * 100) : 0;

    // Subject-wise average (top 5)
    const subjectAverages = await prisma.grade.groupBy({
      by: ["subjectId"],
      _avg: { marks: true },
      _count: { _all: true },
      orderBy: { _avg: { marks: "desc" } },
      take: 5,
    });

    const topSubjects = await Promise.all(
      subjectAverages.map(async (stat) => {
        const subject = await prisma.subject.findUnique({
          where: { id: stat.subjectId! },
          select: { name: true },
        });
        return {
          subjectName: subject?.name || "Unknown",
          average: stat._avg.marks ? Math.round(stat._avg.marks) : 0,
          count: stat._count._all ?? 0,
        };
      })
    );

    // Class-wise average — via student join
    const gradesByStudent = await prisma.grade.groupBy({
      by: ["studentId"],
      _avg: { marks: true },
      _count: { _all: true },
    });

    const classPerformance = await Promise.all(
      gradesByStudent.map(async (stat) => {
        const student = await prisma.student.findUnique({
          where: { id: stat.studentId! },
          select: { class: { select: { name: true } } },
        });
        return {
          className: student?.class?.name || "Unknown",
          average: stat._avg.marks ? Math.round(stat._avg.marks) : 0,
          studentCount: stat._count._all ?? 0,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        overallAverage: overallAvg,
        topSubjects,
        classPerformance,
      },
    });
  } catch (error) {
    console.error("[GRADES_REPORT]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}