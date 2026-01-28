"use server";

import { prisma } from "@/lib/prisma";

export async function updateInvoiceStatus(
  invoiceId: string,
  status: "paid" | "pending" | "overdue"
) {
  return prisma.invoice.update({
    where: { id: invoiceId },
    data: { status },
  });
}
