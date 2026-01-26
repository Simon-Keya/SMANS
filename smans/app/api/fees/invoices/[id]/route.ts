import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import * as z from "zod";

// Validation schema with uppercase enum values to match Prisma
const updateInvoiceSchema = z.object({
  amount: z.number().min(1, "Amount must be greater than 0").optional(),
  dueDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid due date format",
  }).optional(),
  status: z.enum(["PENDING", "PAID", "PARTIAL", "OVERDUE"]).optional(),
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
    const invoice = await prisma.invoice.findUnique({
      where: { id: params.id },
      include: {
        student: { select: { name: true } },
        feeItem: { select: { name: true } },
        payments: true,
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: invoice });
  } catch (error) {
    console.error("[GET_INVOICE]", error);
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
    const parsed = updateInvoiceSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message || "Invalid input" },
        { status: 400 }
      );
    }

    const { amount, dueDate, status } = parsed.data;

    // Optional: verify invoice exists first
    const existing = await prisma.invoice.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const updated = await prisma.invoice.update({
      where: { id: params.id },
      data: {
        amount,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        status,  // Now uppercase values only
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("[UPDATE_INVOICE]", error);
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
    const invoice = await prisma.invoice.findUnique({
      where: { id: params.id },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    await prisma.invoice.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: "Invoice deleted" });
  } catch (error) {
    console.error("[DELETE_INVOICE]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}