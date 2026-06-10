// app/api/payments/route.ts
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { PaymentStatus } from "@prisma/client"; // Import enum

const createPaymentSchema = z.object({
  invoiceId: z.string().min(1, "Invoice is required"),
  amount: z.number().min(1, "Amount must be greater than 0"),
  method: z.string().min(1, "Payment method is required"),
  paymentDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid payment date format",
  }).optional(),
});

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payments = await prisma.payment.findMany({
      include: {
        invoice: {
          include: {
            student: { select: { name: true, admissionNumber: true } }, // Changed from rollNumber
          },
        },
      },
      orderBy: { paymentDate: "desc" },
    });

    return NextResponse.json({ success: true, data: payments });
  } catch (error) {
    console.error("[GET_PAYMENTS]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = createPaymentSchema.safeParse(body);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return NextResponse.json(
        { error: firstIssue?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { invoiceId, amount, method, paymentDate } = parsed.data;

    // Verify invoice exists
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      select: { id: true, amount: true, status: true },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const payment = await prisma.payment.create({
      data: {
        invoiceId,
        amount,
        method,
        paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
        status: PaymentStatus.COMPLETED, // Use enum
      },
      include: {
        invoice: {
          include: {
            student: { select: { name: true } },
          },
        },
      },
    });

    // Auto-update invoice status if fully paid
    if (amount >= invoice.amount) {
      await prisma.invoice.update({
        where: { id: invoiceId },
        data: { status: "PAID" },
      });
    } else if (amount > 0) {
      await prisma.invoice.update({
        where: { id: invoiceId },
        data: { status: "PARTIAL" },
      });
    }

    return NextResponse.json({ success: true, data: payment }, { status: 201 });
  } catch (error) {
    console.error("[CREATE_PAYMENT]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}