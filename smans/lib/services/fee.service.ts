// lib/services/fee.service.ts
import { prisma } from "@/lib/prisma";

export class FeeService {
  /**
   * Create a fee item (e.g. Tuition, Exam fee, Activity fee)
   */
  static async createFeeItem(data: {
    name: string;
    amount: number;
    frequency: "once" | "monthly" | "termly" | "yearly";
    description?: string | null;
  }) {
    return prisma.feeItem.create({
      data: {
        name: data.name.trim(),
        amount: data.amount,
        frequency: data.frequency,
        description: data.description?.trim() ?? null,
      },
    });
  }

  /**
   * Generate invoice for a student (can include multiple fee items)
   */
  static async generateInvoice(studentId: string, feeItemIds: string[]) {
    const feeItems = await prisma.feeItem.findMany({
      where: { id: { in: feeItemIds } },
    });

    if (feeItems.length !== feeItemIds.length) {
      throw new Error("One or more fee items not found");
    }

    const totalAmount = feeItems.reduce((sum, item) => sum + item.amount, 0);

    return prisma.invoice.create({
      data: {
        studentId,
        amount: totalAmount,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        status: "PENDING",
        feeItemId: feeItems.length === 1 ? feeItems[0].id : null, // optional
      },
      include: {
        student: { select: { name: true, rollNumber: true } },
      },
    });
  }

  /**
   * Get all pending/overdue invoices for a student
   */
  static async getPendingInvoices(studentId: string) {
    return prisma.invoice.findMany({
      where: {
        studentId,
        status: { in: ["PENDING", "PARTIAL", "OVERDUE"] },
      },
      orderBy: { dueDate: "asc" },
      include: {
        feeItem: true,
        payments: true,
      },
    });
  }
}