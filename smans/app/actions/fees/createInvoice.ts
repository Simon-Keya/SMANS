"use server";

import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createInvoiceSchema = z.object({
  studentId: z.string().min(1, "Student is required"),
  feeItemId: z.string().optional(),
  amount: z.number().positive("Amount must be positive"),
  dueDate: z.coerce.date().min(new Date(), "Due date must be in the future"),
  description: z.string().optional(),
});

export async function createInvoiceAction(input: unknown) {
  const user = await getCurrentUser();

  if (!user || !["ADMIN", "ACCOUNTANT"].includes(user.role)) {
    throw new Error("Unauthorized: Only admins and accountants can create invoices");
  }

  const validated = createInvoiceSchema.safeParse(input);
  if (!validated.success) {
    throw new Error(validated.error.issues[0]?.message || "Invalid input");
  }

  const data = validated.data;

  try {
    const invoice = await prisma.invoice.create({
      data: {
        studentId: data.studentId,
        feeItemId: data.feeItemId || null,
        amount: data.amount,
        dueDate: data.dueDate,
        description: data.description?.trim(),
        status: "PENDING",
        createdById: user.id,          // track who created it
        approvedById: user.role === "ACCOUNTANT" ? user.id : null,
      },
    });

    return { success: true, invoice };
  } catch (error) {
    console.error("Create invoice error:", error);
    throw new Error("Failed to create invoice. Please try again.");
  }
}