// lib/dashboard/accountant.ts
import { prisma } from "@/lib/prisma";

export async function getAccountantStats(userId: string) {
  const financialData = await Promise.all([
    prisma.invoice.aggregate({
      where: { status: "PENDING" },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.invoice.aggregate({
      where: { status: "PAID" },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.invoice.aggregate({
      where: { status: "OVERDUE" },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: {
        paymentDate: {
          gte: new Date(new Date().setDate(new Date().getDate() - 30)),
        },
      },
    }),
    prisma.invoice.count(),
    prisma.payment.count(),
    prisma.feeItem.count(),
  ]);
  
  const [pending, paid, overdue, recentPayments, totalInvoicesCount, totalPaymentsCount, totalFeeItems] = financialData;

  const [accountantNotifications, accountantUnread] = await Promise.all([
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
    pendingAmount: pending._sum.amount || 0,
    pendingCount: pending._count,
    paidAmount: paid._sum.amount || 0,
    paidCount: paid._count,
    overdueAmount: overdue._sum.amount || 0,
    overdueCount: overdue._count,
    recentPaymentsAmount: recentPayments._sum.amount || 0,
    totalInvoices: totalInvoicesCount,
    totalPayments: totalPaymentsCount,
    totalFeeItems,
    totalNotifications: accountantNotifications,
    unreadNotifications: accountantUnread,
  };
}