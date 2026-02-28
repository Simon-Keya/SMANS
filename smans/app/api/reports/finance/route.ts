// app/api/reports/finance/route.ts
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
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

    // Total collected this month
    const totalCollected = await prisma.payment.aggregate({
      where: { paymentDate: { gte: monthStart } },
      _sum: { amount: true },
    });

    // Pending fees
    const pendingFees = await prisma.invoice.aggregate({
      where: { status: "PENDING" },
      _sum: { amount: true },
    });

    // Overdue invoices
    const overdue = await prisma.invoice.count({
      where: {
        status: "OVERDUE",
        dueDate: { lt: new Date() },
      },
    });

    // Payment methods breakdown
    const methodBreakdown = await prisma.payment.groupBy({
      by: ["method"],
      where: { paymentDate: { gte: monthStart } },
      _sum: { amount: true },
      _count: { _all: true },
    });

    return NextResponse.json({
      success: true,
      data: {
        thisMonthCollected: totalCollected._sum.amount ?? 0,
        pendingFees: pendingFees._sum.amount ?? 0,
        overdueInvoices: overdue,
        paymentMethods: methodBreakdown.map(m => ({
          method: m.method,
          amount: m._sum.amount ?? 0,
          count: m._count._all,
        })),
      },
    });
  } catch (error) {
    console.error("[FINANCE_REPORT]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}