"use server";

import { prisma } from "@/lib/prisma";
import { assertCanAccessInvoice } from "@/lib/auth/ownership";

export async function getInvoiceByIdAction(invoiceId: string) {
  await assertCanAccessInvoice(invoiceId);

  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    select: {
      id: true,
      student: { select: { id: true, name: true } },
      feeItem: { select: { name: true } },
      amount: true,
      dueDate: true,
      status: true,
      createdAt: true,
      createdBy: { select: { name: true } },
      approvedBy: { select: { name: true } },
      payments: {
        select: {
          id: true,
          amount: true,
          method: true,
          status: true,
          paymentDate: true,
          createdBy: { select: { name: true } },
        },
        orderBy: { paymentDate: "desc" },
      },
    },
  });

  if (!invoice) {
    throw new Error("Invoice not found");
  }

  return invoice;
}
