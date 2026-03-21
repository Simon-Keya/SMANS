"use server";

import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { z } from "zod";

// Define input schema
const recordPaymentSchema = z.object({
  invoiceId: z.string().min(1, "Invoice ID is required"),
  amount: z.number().positive("Amount must be greater than 0"),
  method: z.string().min(1, "Payment method is required").default("cash"),
  status: z.enum(["PENDING", "COMPLETED", "FAILED"]).default("COMPLETED").optional(),
});

type RecordPaymentInput = z.infer<typeof recordPaymentSchema>;

export async function recordPayment(input: RecordPaymentInput) {
  const user = await getCurrentUser();

  if (!user || !["ADMIN", "ACCOUNTANT"].includes(user.role)) {
    throw new Error("Unauthorized: Only admins and accountants can record payments");
  }

  const validated = recordPaymentSchema.safeParse(input);
  if (!validated.success) {
    throw new Error(validated.error.issues[0]?.message || "Invalid input");
  }

  const { invoiceId, amount, method, status = "COMPLETED" } = validated.data;

  try {
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. Create payment record
      const payment = await tx.payment.create({
        data: {
          invoiceId,
          amount,
          method: method.trim(),
          status,
          paymentDate: new Date(),
          createdById: user.id,
          approvedById: user.role === "ACCOUNTANT" ? user.id : null,
        },
      });

      // 2. Get current invoice state (including all existing payments)
      const invoice = await tx.invoice.findUnique({
        where: { id: invoiceId },
        include: {
          payments: {
            select: { amount: true },
          },
        },
      });

      if (!invoice) {
        throw new Error("Invoice not found");
      }

      // 3. Calculate total paid (including this new payment)
      const totalPaid = invoice.payments.reduce((sum: number, p: { amount: number }) => sum + p.amount, 0) + amount;

      // 4. Determine new invoice status
      let newStatus: "PENDING" | "PARTIAL" | "PAID" | "OVERDUE";

      if (totalPaid >= invoice.amount) {
        newStatus = "PAID";
      } else if (totalPaid > 0) {
        newStatus = "PARTIAL";
      } else {
        newStatus = "PENDING";
      }

      // Auto-set OVERDUE if past due date and not fully paid
      if (newStatus !== "PAID" && new Date() > invoice.dueDate) {
        newStatus = "OVERDUE";
      }

      // 5. Update invoice status
      await tx.invoice.update({
        where: { id: invoiceId },
        data: { status: newStatus },
      });

      return { success: true, payment };
    });
  } catch (error) {
    console.error("Record payment transaction error:", error);
    throw new Error("Failed to record payment. Please try again.");
  }
}