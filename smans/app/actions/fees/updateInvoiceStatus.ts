"use server";

import { prisma } from "@/lib/prisma";

export async function updateInvoiceStatus(
  invoiceId: string,
  statusInput: "pending" | "paid" | "partial" | "overdue"  // lowercase input
) {
  // Convert to uppercase to match Prisma enum
  const status = statusInput.toUpperCase() as "PENDING" | "PAID" | "PARTIAL" | "OVERDUE";

  if (!invoiceId) {
    throw new Error("Invoice ID is required");
  }

  return prisma.invoice.update({
    where: { id: invoiceId },
    data: { status },
  });
}