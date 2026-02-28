// app/api/reports/overview/route.ts
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
    // Total students
    const totalStudents = await prisma.student.count();

    // Total teachers
    const totalTeachers = await prisma.user.count({
      where: { role: "TEACHER" },
    });

    // Average attendance (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const attendanceRecords = await prisma.attendance.count({
      where: { date: { gte: thirtyDaysAgo } },
    });
    const presentRecords = await prisma.attendance.count({
      where: {
        date: { gte: thirtyDaysAgo },
        status: "PRESENT",
      },
    });
    const avgAttendance = attendanceRecords > 0 ? Math.round((presentRecords / attendanceRecords) * 100) : 0;

    // Total revenue this month
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const revenueThisMonth = await prisma.payment.aggregate({
      where: { paymentDate: { gte: monthStart } },
      _sum: { amount: true },
    });

    // Pending invoices
    const pendingInvoices = await prisma.invoice.count({
      where: { status: "PENDING" },
    });

    return NextResponse.json({
      success: true,
      data: {
        totalStudents,
        totalTeachers,
        averageAttendance30Days: avgAttendance,
        revenueThisMonth: revenueThisMonth._sum.amount ?? 0,
        pendingInvoices,
        alerts: pendingInvoices > 50 ? "High pending fees" : "All good",
      },
    });
  } catch (error) {
    console.error("[OVERVIEW_REPORT]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}