"use server";

import { prisma } from "@/lib/prisma";

export async function recordPayment(
  invoiceId: string,
  amount: number
) {
  return prisma.$transaction(async tx => {
    const payment = await tx.payment.create({
      data: { invoiceId, amount },
    });

    const paid = await tx.payment.aggregate({
      where: { invoiceId },
      _sum: { amount: true },
    });

    await tx.invoice.update({
      where: { id: invoiceId },
      data: {
        status:
          paid._sum.amount! >=
          (await tx.invoice.findUnique({ where: { id: invoiceId } }))!.total
            ? "paid"
            : "partial",
      },
    });

    return payment;
  });
}
