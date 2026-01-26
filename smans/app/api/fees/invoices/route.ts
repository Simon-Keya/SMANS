import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import * as z from "zod";

// Validation schema
const createInvoiceSchema = z.object({
  studentId: z.string().min(1, "Student is required"),
  feeItemId: z.string().optional(),
  amount: z.number().min(1, "Amount must be greater than 0"),
  dueDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid due date",
  }),
});

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const invoices = await prisma.invoice.findMany({
      include: {
        student: { select: { name: true } },
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

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = createInvoiceSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message || "Invalid input" },
        { status: 400 }
      );
    }

    const { studentId, feeItemId, amount, dueDate } = parsed.data;

    // Optional: verify student exists
    const studentExists = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!studentExists) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const invoice = await prisma.invoice.create({
      data: {
        studentId,
        feeItemId: feeItemId || null,
        amount,
        dueDate: new Date(dueDate),
        status: "PENDING",  // ← FIXED: uppercase to match enum
      },
    });

    return NextResponse.json({ success: true, data: invoice }, { status: 201 });
  } catch (error) {
    console.error("[CREATE_INVOICE]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}