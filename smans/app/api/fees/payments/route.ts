import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import * as z from "zod";

const createPaymentSchema = z.object({
  invoiceId: z.string().min(1, "Invoice is required"),
  amount: z.number().min(1, "Amount must be greater than 0"),
  method: z.string().min(1, "Payment method is required"),
  paymentDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid payment date",
  }).optional(),
});

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payments = await prisma.payment.findMany({
      include: {
        invoice: {
          include: {
            student: { select: { name: true } },
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

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = createPaymentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { invoiceId, amount, method, paymentDate } = parsed.data;

    // Verify invoice exists
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
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
        status: "completed",
      },
    });

    // Update invoice status if needed (simplified)
    if (amount >= invoice.amount) {
      await prisma.invoice.update({
        where: { id: invoiceId },
        data: { status: "paid" },
      });
    }

    return NextResponse.json({ success: true, data: payment }, { status: 201 });
  } catch (error) {
    console.error("[CREATE_PAYMENT]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}