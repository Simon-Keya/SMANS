// app/actions/reports/generateFinanceReport.ts
"use server";

import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function generateFinanceReport() {
  const user = await getCurrentUser();

  if (!user || !["ADMIN", "ACCOUNTANT"].includes(user.role)) {
    throw new Error("Unauthorized: Only admins and accountants can generate finance reports");
  }

  try {
    const invoices = await prisma.invoice.findMany({
      include: {
        student: {
          select: {
            id: true,
            name: true,
            rollNumber: true,
            class: { select: { name: true } },
          },
        },
        payments: {
          select: {
            id: true,
            amount: true,
            method: true,
            status: true,
            paymentDate: true,
          },
          orderBy: { paymentDate: "desc" },
        },
      },
      orderBy: { dueDate: "desc" },
    });

    // Explicit typing for reduce operations
    const totalAmountDue = invoices.reduce((sum: number, inv: any) => sum + inv.amount, 0);

    const totalPaid = invoices.reduce((sum: number, inv: any) => {
      return sum + inv.payments.reduce((pSum: number, p: any) => 
        pSum + (p.status === "COMPLETED" ? p.amount : 0), 0
      );
    }, 0);

    const pendingInvoices = invoices.filter((inv: any) => {
      const paid = inv.payments.reduce((pSum: number, p: any) => 
        pSum + (p.status === "COMPLETED" ? p.amount : 0), 0
      );
      return paid < inv.amount;
    }).length;

    return {
      success: true,
      report: {
        totalInvoices: invoices.length,
        totalAmountDue,
        totalPaid,
        pendingInvoices,
        balanceDue: totalAmountDue - totalPaid,
        invoices,
      },
      generatedAt: new Date().toISOString(),
      generatedBy: user.name || user.email,
    };
  } catch (error) {
    console.error("Generate finance report error:", error);
    throw new Error("Failed to generate finance report. Please try again.");
  }
}