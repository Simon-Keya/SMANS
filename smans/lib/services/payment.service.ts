import { prisma } from "@/lib/prisma";

export class PaymentService {
  static async recordPayment(invoiceId: string, amount: number, method: string = "cash") {
    return prisma.$transaction(async tx => {
      const payment = await tx.payment.create({
        data: {
          invoiceId,
          amount,
          method,
          status: "COMPLETED",
          paymentDate: new Date(),
        },
      });

      const invoice = await tx.invoice.findUnique({
        where: { id: invoiceId },
        include: { payments: true },
      });

      if (!invoice) throw new Error("Invoice not found");

      const totalPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0);

      const newStatus =
        totalPaid >= invoice.amount
          ? "PAID"
          : totalPaid > 0
            ? "PARTIAL"
            : "PENDING";

      await tx.invoice.update({
        where: { id: invoiceId },
        data: { status: newStatus },
      });

      return payment;
    });
  }
}