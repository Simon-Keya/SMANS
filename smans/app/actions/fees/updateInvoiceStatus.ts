"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/permissions";
import { z } from "zod";

const statusSchema = z.enum(["pending", "paid", "partial", "overdue"]);

export async function updateInvoiceStatus(
  invoiceId: string,
  statusInput: "pending" | "paid" | "partial" | "overdue"
) {
  await requirePermission("fees:write");

  if (!invoiceId?.trim()) {
    throw new Error("Invoice ID is required");
  }

  const parsed = statusSchema.safeParse(statusInput);
  if (!parsed.success) {
    throw new Error("Invalid invoice status");
  }

  const status = parsed.data.toUpperCase() as
    | "PENDING"
    | "PAID"
    | "PARTIAL"
    | "OVERDUE";

  return prisma.invoice.update({
    where: { id: invoiceId },
    data: { status },
  });
}
