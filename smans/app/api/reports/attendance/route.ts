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
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Today's attendance
    const presentToday = await prisma.attendance.count({
      where: { date: today, present: true },
    });

    const totalToday = await prisma.attendance.count({
      where: { date: today },
    });

    const todayRate = totalToday > 0 ? Math.round((presentToday / totalToday) * 100) : 0;

    // This month
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const presentThisMonth = await prisma.attendance.count({
      where: {
        date: { gte: monthStart },
        present: true,
      },
    });

    const totalThisMonth = await prisma.attendance.count({
      where: { date: { gte: monthStart } },
    });

    const monthRate = totalThisMonth > 0 ? Math.round((presentThisMonth / totalThisMonth) * 100) : 0;

    // Class-wise breakdown (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Step 1: Get total records per student
    const studentTotalStats = await prisma.attendance.groupBy({
      by: ["studentId"],
      where: {
        date: { gte: thirtyDaysAgo },
      },
      _count: {
        _all: true,  // Total attendance records per student
      },
    });

    // Step 2: Get present records per student (separate query - can't sum boolean in groupBy)
    const studentPresentStats = await prisma.attendance.groupBy({
      by: ["studentId"],
      where: {
        date: { gte: thirtyDaysAgo },
        present: true,
      },
      _count: {
        _all: true,  // Count of present days per student
      },
    });

    // Combine totals and presents into a map
    const studentStatsMap = new Map<string, { total: number; present: number }>();

    studentTotalStats.forEach((stat) => {
      const studentId = stat.studentId!;
      studentStatsMap.set(studentId, {
        total: stat._count._all,
        present: 0,
      });
    });

    studentPresentStats.forEach((stat) => {
      const studentId = stat.studentId!;
      if (studentStatsMap.has(studentId)) {
        studentStatsMap.get(studentId)!.present = stat._count._all;
      }
    });

    // Step 3: Map to class names
    const classAttendance: { className: string; total: number; present: number; rate: number }[] = [];

    for (const [studentId, stats] of studentStatsMap) {
      const student = await prisma.student.findUnique({
        where: { id: studentId },
        select: {
          class: {
            select: { name: true },
          },
        },
      });

      const className = student?.class?.name || "Unknown";

      const rate = stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0;

      // Aggregate per class
      const existing = classAttendance.find(c => c.className === className);
      if (existing) {
        existing.total += stats.total;
        existing.present += stats.present;
        existing.rate = existing.total > 0 ? Math.round((existing.present / existing.total) * 100) : 0;
      } else {
        classAttendance.push({
          className,
          total: stats.total,
          present: stats.present,
          rate,
        });
      }
    }

    return NextResponse.json({
      today: { present: presentToday, total: totalToday, rate: todayRate },
      thisMonth: { present: presentThisMonth, total: totalThisMonth, rate: monthRate },
      classBreakdown: classAttendance,
    });
  } catch (error) {
    console.error("[ATTENDANCE_REPORT_ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}