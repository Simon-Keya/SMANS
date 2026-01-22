import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role?.toLowerCase() !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Total collected this month
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const totalCollected = await prisma.payment.aggregate({
      where: { paymentDate: { gte: monthStart } },
      _sum: { amount: true },
    });

    // Pending fees
    const pendingFees = await prisma.invoice.aggregate({
      where: { status: "pending" },
      _sum: { amount: true },
    });

    // Overdue invoices
    const overdue = await prisma.invoice.count({
      where: {
        status: "overdue",
        dueDate: { lt: new Date() },
      },
    });

    // Payment methods breakdown
    const methodBreakdown = await prisma.payment.groupBy({
      by: ["method"],
      _sum: { amount: true },
      _count: { _all: true },
    });

    return NextResponse.json({
      thisMonthCollected: totalCollected._sum.amount || 0,
      pendingFees: pendingFees._sum.amount || 0,
      overdueInvoices: overdue,
      paymentMethods: methodBreakdown.map(m => ({
        method: m.method,
        amount: m._sum.amount || 0,
        count: m._count._all,
      })),
    });
  } catch (error) {
    console.error("[FINANCE_REPORT_ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}