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

    // Class-wise breakdown (example - last 30 days)
    const classStats = await prisma.attendance.groupBy({
      by: ["classId"],
      where: {
        date: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
      _count: { _all: true },
      _sum: { present: true },
    });

    const classAttendance = await Promise.all(
      classStats.map(async (stat) => {
        const classInfo = await prisma.class.findUnique({
          where: { id: stat.classId! },
          select: { name: true },
        });
        return {
          className: classInfo?.name || "Unknown",
          rate: stat._count._all > 0 ? Math.round((stat._sum.present || 0) / stat._count._all * 100) : 0,
        };
      })
    );

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