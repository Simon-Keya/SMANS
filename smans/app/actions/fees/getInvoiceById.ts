"use server";

import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function getInvoiceByIdAction(invoiceId: string) {
  const user = await getCurrentUser();

  if (!user || !["ADMIN", "ACCOUNTANT"].includes(user.role)) {
    throw new Error("Unauthorized");
  }

  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    select: {
      id: true,
      student: { select: { id: true, name: true } },
      feeItem: { select: { name: true } },
      amount: true,
      dueDate: true,
      status: true,
      description: true,
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