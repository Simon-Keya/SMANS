// lib/services/fee.service.ts
import { prisma } from "@/lib/prisma";
import { InvoiceStatus, PaymentStatus } from "@prisma/client";

export class FeeService {
  /**
   * Create a fee item (e.g. Tuition, Exam fee, Activity fee)
   */
  static async createFeeItem(data: {
    name: string;
    amount: number;
    frequency: "ONCE" | "MONTHLY" | "TERM" | "YEARLY";
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
   * Get all fee items
   */
  static async getAllFeeItems() {
    return prisma.feeItem.findMany({
      orderBy: { name: "asc" },
    });
  }

  /**
   * Get fee item by ID
   */
  static async getFeeItemById(id: string) {
    return prisma.feeItem.findUnique({
      where: { id },
      include: {
        invoices: {
          take: 10,
          orderBy: { createdAt: "desc" },
        },
      },
    });
  }

  /**
   * Update fee item
   */
  static async updateFeeItem(
    id: string,
    data: {
      name?: string;
      amount?: number;
      frequency?: "ONCE" | "MONTHLY" | "TERM" | "YEARLY";
      description?: string | null;
    }
  ) {
    return prisma.feeItem.update({
      where: { id },
      data: {
        name: data.name?.trim(),
        amount: data.amount,
        frequency: data.frequency,
        description: data.description?.trim() ?? null,
      },
    });
  }

  /**
   * Delete fee item (only if not used in any invoice)
   */
  static async deleteFeeItem(id: string) {
    const invoiceCount = await prisma.invoice.count({
      where: { feeItemId: id },
    });

    if (invoiceCount > 0) {
      throw new Error(`Cannot delete fee item. It is used in ${invoiceCount} invoice(s).`);
    }

    return prisma.feeItem.delete({ where: { id } });
  }

  /**
   * Generate invoice for a student (can include multiple fee items)
   */
  static async generateInvoice(
    studentId: string,
    feeItemIds: string[],
    dueDate?: Date
  ) {
    const feeItems = await prisma.feeItem.findMany({
      where: { id: { in: feeItemIds } },
    });

    if (feeItems.length !== feeItemIds.length) {
      throw new Error("One or more fee items not found");
    }

    // Validate student exists
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });
    if (!student) throw new Error("Student not found");

    const totalAmount = feeItems.reduce((sum, item) => sum + item.amount, 0);
    const defaultDueDate = new Date();
    defaultDueDate.setDate(defaultDueDate.getDate() + 30); // 30 days from now

    return prisma.invoice.create({
      data: {
        studentId,
        amount: totalAmount,
        dueDate: dueDate || defaultDueDate,
        status: InvoiceStatus.PENDING,
        feeItemId: feeItems.length === 1 ? feeItems[0].id : null,
      },
      include: {
        student: { 
          select: { 
            name: true, 
            admissionNumber: true,
            class: { select: { name: true } }
          } 
        },
        feeItem: true,
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
        status: { in: [InvoiceStatus.PENDING, InvoiceStatus.PARTIAL, InvoiceStatus.OVERDUE] },
      },
      orderBy: { dueDate: "asc" },
      include: {
        feeItem: true,
        payments: {
          orderBy: { paymentDate: "desc" },
        },
      },
    });
  }

  /**
   * Get all invoices with optional filters
   */
  static async getAllInvoices(filters?: {
    status?: InvoiceStatus;
    fromDate?: Date;
    toDate?: Date;
    studentId?: string;
  }) {
    return prisma.invoice.findMany({
      where: {
        status: filters?.status,
        studentId: filters?.studentId,
        dueDate: {
          gte: filters?.fromDate,
          lte: filters?.toDate,
        },
      },
      include: {
        student: {
          select: {
            name: true,
            admissionNumber: true,
            class: { select: { name: true } },
          },
        },
        feeItem: true,
        payments: {
          orderBy: { paymentDate: "desc" },
        },
        _count: {
          select: { payments: true },
        },
      },
      orderBy: { dueDate: "desc" },
    });
  }

  /**
   * Get invoice by ID with full details
   */
  static async getInvoiceById(invoiceId: string) {
    return prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            admissionNumber: true,
            class: { select: { name: true } },
            parent: { select: { name: true, phone: true, email: true } },
          },
        },
        feeItem: true,
        payments: {
          include: {
            createdBy: { select: { name: true } },
            approvedBy: { select: { name: true } },
          },
          orderBy: { paymentDate: "desc" },
        },
        createdBy: { select: { name: true } },
        approvedBy: { select: { name: true } },
      },
    });
  }

  /**
   * Record a payment against an invoice
   */
  static async recordPayment(
    invoiceId: string,
    data: {
      amount: number;
      method: string;
      paymentDate?: Date;
      createdById?: string;
    }
  ) {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice) throw new Error("Invoice not found");

    const payment = await prisma.payment.create({
      data: {
        invoiceId,
        amount: data.amount,
        method: data.method,
        paymentDate: data.paymentDate || new Date(),
        status: PaymentStatus.COMPLETED,
        createdById: data.createdById,
      },
    });

    // Update invoice status based on total paid
    const totalPaid = await prisma.payment.aggregate({
      where: { invoiceId, status: PaymentStatus.COMPLETED },
      _sum: { amount: true },
    });

    const paidAmount = totalPaid._sum.amount || 0;
    let newStatus: InvoiceStatus = InvoiceStatus.PENDING;

    if (paidAmount >= invoice.amount) {
      newStatus = InvoiceStatus.PAID;
    } else if (paidAmount > 0) {
      newStatus = InvoiceStatus.PARTIAL;
    }

    await prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: newStatus },
    });

    return payment;
  }

  /**
   * Get payment by ID
   */
  static async getPaymentById(paymentId: string) {
    return prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        invoice: {
          include: {
            student: {
              select: {
                name: true,
                admissionNumber: true,
              },
            },
          },
        },
        createdBy: { select: { name: true } },
        approvedBy: { select: { name: true } },
      },
    });
  }

  /**
   * Get all payments with optional filters
   */
  static async getAllPayments(filters?: {
    status?: PaymentStatus;
    fromDate?: Date;
    toDate?: Date;
    studentId?: string;
  }) {
    return prisma.payment.findMany({
      where: {
        status: filters?.status,
        paymentDate: {
          gte: filters?.fromDate,
          lte: filters?.toDate,
        },
        invoice: filters?.studentId ? { studentId: filters.studentId } : undefined,
      },
      include: {
        invoice: {
          include: {
            student: {
              select: {
                name: true,
                admissionNumber: true,
                class: { select: { name: true } },
              },
            },
          },
        },
        createdBy: { select: { name: true } },
      },
      orderBy: { paymentDate: "desc" },
    });
  }

  /**
   * Get fee collection statistics
   */
  static async getCollectionStats(startDate: Date, endDate: Date) {
    const payments = await prisma.payment.findMany({
      where: {
        paymentDate: { gte: startDate, lte: endDate },
        status: PaymentStatus.COMPLETED,
      },
      include: {
        invoice: {
          include: {
            student: {
              select: { classId: true },
            },
          },
        },
      },
    });

    const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0);
    const totalTransactions = payments.length;

    // Group by class
    const byClass: Record<string, number> = {};
    for (const payment of payments) {
      const className = payment.invoice.student.classId;
      byClass[className] = (byClass[className] || 0) + payment.amount;
    }

    return {
      totalCollected,
      totalTransactions,
      averageTransaction: totalTransactions > 0 ? totalCollected / totalTransactions : 0,
      byClass,
      startDate,
      endDate,
    };
  }
}