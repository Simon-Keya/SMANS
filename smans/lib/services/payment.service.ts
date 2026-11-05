import { prisma } from "@/lib/prisma";
import { sumMoney, gteMoney, gtMoney, toDecimal } from "@/lib/money";

export class PaymentService {
  static async recordPayment(invoiceId: string, amount: number, method: string = "cash") {
    return prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          invoiceId,
          amount: toDecimal(amount),
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

      const totalPaid = sumMoney(invoice.payments.map((p) => p.amount));

      const newStatus = gteMoney(totalPaid, invoice.amount)
        ? "PAID"
        : gtMoney(totalPaid, 0)
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
