"use server";

import { prisma } from "@/lib/prisma";

export async function recordPayment(
  invoiceId: string,
  amount: number,
  method: string = "cash"  // ← default or required parameter
) {
  // Optional: basic validation
  if (!invoiceId) {
    throw new Error("Invoice ID is required");
  }
  if (amount <= 0) {
    throw new Error("Amount must be greater than 0");
  }

  return prisma.$transaction(async (tx) => {
    // 1. Create the payment record
    const payment = await tx.payment.create({
      data: {
        invoiceId,
        amount,
        method,                    // ← now provided (required field)
        status: "COMPLETED",       // ← default to COMPLETED (or pass as param)
        paymentDate: new Date(),
      },
    });

    // 2. Get the invoice (with current total paid)
    const invoice = await tx.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        payments: true,  // get all payments for this invoice
      },
    });

    if (!invoice) {
      throw new Error("Invoice not found");
    }

    // 3. Calculate total paid so far
    const totalPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0);

    // 4. Update invoice status based on total paid
    const newStatus =
      totalPaid >= invoice.amount
        ? "PAID"                  // ← uppercase to match enum
        : totalPaid > 0
          ? "PARTIAL"             // ← uppercase
          : "PENDING";            // ← uppercase

    await tx.invoice.update({
      where: { id: invoiceId },
      data: { status: newStatus },
    });

    return payment;
  });
}