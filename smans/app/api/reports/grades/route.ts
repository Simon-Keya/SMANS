import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !["admin", "teacher"].includes(session.user.role?.toLowerCase() ?? "")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Overall average grade (last 30 days example)
    const recentGrades = await prisma.grade.findMany({
      where: {
        createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
      select: { marks: true, maxMarks: true },
    });

    const totalMarks = recentGrades.reduce((sum, g) => sum + g.marks, 0);
    const totalMax = recentGrades.reduce((sum, g) => sum + g.maxMarks, 0);
    const overallAvg = totalMax > 0 ? Math.round((totalMarks / totalMax) * 100) : 0;

    // Subject-wise average
    const subjectAverages = await prisma.grade.groupBy({
      by: ["subjectId"],
      _avg: { marks: true },
      _count: { marks: true },
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
          count: stat._count.marks,
        };
      })
    );

    // Class-wise average (example)
    const classAverages = await prisma.grade.groupBy({
      by: ["classId"],
      _avg: { marks: true },
      _count: { marks: true },
    });

    const classPerformance = await Promise.all(
      classAverages.map(async (stat) => {
        const cls = await prisma.class.findUnique({
          where: { id: stat.classId! },
          select: { name: true },
        });
        return {
          className: cls?.name || "Unknown",
          average: stat._avg.marks ? Math.round(stat._avg.marks) : 0,
          studentCount: stat._count.marks,
        };
      })
    );

    return NextResponse.json({
      overallAverage: overallAvg,
      topSubjects,
      classPerformance,
    });
  } catch (error) {
    console.error("[GRADES_REPORT_ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}