// app/api/reports/attendance/route.ts
import { authOptions } from "@/lib/auth/auth"; // FIXED: correct path
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Today's attendance
    const presentToday = await prisma.attendance.count({
      where: { date: today, status: "PRESENT" },
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
        status: "PRESENT",
      },
    });

    const totalThisMonth = await prisma.attendance.count({
      where: { date: { gte: monthStart } },
    });

    const monthRate = totalThisMonth > 0 ? Math.round((presentThisMonth / totalThisMonth) * 100) : 0;

    // Class-wise breakdown (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const attendanceStats = await prisma.attendance.groupBy({
      by: ["classId"],
      where: { date: { gte: thirtyDaysAgo } },
      _count: { _all: true },
      _sum: { status: { equals: "PRESENT" } }, // Prisma doesn't support sum on enum directly, so we use two queries
    });

    // Better: separate present count
    const presentStats = await prisma.attendance.groupBy({
      by: ["classId"],
      where: {
        date: { gte: thirtyDaysAgo },
        status: "PRESENT",
      },
      _count: { _all: true },
    });

    const classStatsMap = new Map<string, { total: number; present: number }>();

    attendanceStats.forEach(stat => {
      classStatsMap.set(stat.classId!, {
        total: stat._count._all,
        present: 0,
      });
    });

    presentStats.forEach(stat => {
      if (classStatsMap.has(stat.classId!)) {
        classStatsMap.get(stat.classId!)!.present = stat._count._all;
      }
    });

    // Map to class names
    const classAttendance = await Promise.all(
      Array.from(classStatsMap.entries()).map(async ([classId, stats]) => {
        const cls = await prisma.class.findUnique({
          where: { id: classId },
          select: { name: true },
        });

        const rate = stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0;

        return {
          className: cls?.name || "Unknown",
          total: stats.total,
          present: stats.present,
          rate,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        today: { present: presentToday, total: totalToday, rate: todayRate },
        thisMonth: { present: presentThisMonth, total: totalThisMonth, rate: monthRate },
        classBreakdown: classAttendance,
      },
    });
  } catch (error) {
    console.error("[ATTENDANCE_REPORT]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}