// app/api/invoices/route.ts
import { authOptions } from "@/lib/auth/auth"; // FIXED: correct path
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const createInvoiceSchema = z.object({
  studentId: z.string().min(1, "Student is required"),
  feeItemId: z.string().optional(),
  amount: z.number().min(1, "Amount must be greater than 0"),
  dueDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid due date format",
  }),
});

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const invoices = await prisma.invoice.findMany({
      include: {
        student: { select: { name: true, rollNumber: true } },
        feeItem: { select: { name: true } },
      },
      orderBy: { dueDate: "desc" },
    });

    return NextResponse.json({ success: true, data: invoices });
  } catch (error) {
    console.error("[GET_INVOICES]", error);
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
    const parsed = createInvoiceSchema.safeParse(body);

    if (!parsed.success) {
      // FIXED: proper Zod error handling
      const firstIssue = parsed.error.issues[0];
      return NextResponse.json(
        { error: firstIssue?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { studentId, feeItemId, amount, dueDate } = parsed.data;

    // Verify student exists
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Optional: verify fee item exists if provided
    if (feeItemId) {
      const feeItem = await prisma.feeItem.findUnique({
        where: { id: feeItemId },
      });
      if (!feeItem) {
        return NextResponse.json({ error: "Fee item not found" }, { status: 404 });
      }
    }

    const invoice = await prisma.invoice.create({
      data: {
        studentId,
        feeItemId: feeItemId || null,
        amount,
        dueDate: new Date(dueDate),
        status: "PENDING",
      },
      include: {
        student: { select: { name: true } },
        feeItem: { select: { name: true } },
      },
    });

    return NextResponse.json({ success: true, data: invoice }, { status: 201 });
  } catch (error) {
    console.error("[CREATE_INVOICE]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}