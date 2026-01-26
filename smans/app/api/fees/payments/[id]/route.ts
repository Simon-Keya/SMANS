import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import * as z from "zod";

// Validation schema — use UPPERCASE to match Prisma enum
const updatePaymentSchema = z.object({
  amount: z.number().min(1, "Amount must be greater than 0").optional(),
  method: z.string().min(1, "Method is required").optional(),
  status: z.enum(["PENDING", "COMPLETED", "FAILED"]).optional(), // ← FIXED: uppercase
});

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payment = await prisma.payment.findUnique({
      where: { id: params.id },
      include: {
        invoice: {
          include: {
            student: { select: { name: true } },
          },
        },
      },
    });

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: payment });
  } catch (error) {
    console.error("[GET_PAYMENT]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = updatePaymentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message || "Invalid input" },
        { status: 400 }
      );
    }

    const { amount, method, status } = parsed.data;

    // Optional: check if payment exists first
    const existing = await prisma.payment.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    const updated = await prisma.payment.update({
      where: { id: params.id },
      data: {
        amount,
        method,
        status,  // Now uppercase values only — matches Prisma enum
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("[UPDATE_PAYMENT]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payment = await prisma.payment.findUnique({
      where: { id: params.id },
    });

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    await prisma.payment.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: "Payment deleted" });
  } catch (error) {
    console.error("[DELETE_PAYMENT]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}