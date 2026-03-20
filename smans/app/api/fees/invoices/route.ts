import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const createInvoiceSchema = z.object({
  studentId: z.string().min(1),
  feeItemId: z.string().optional(),
  amount: z.number().positive(),
  dueDate: z.coerce.date(),
  description: z.string().optional(),
});

// GET: List all invoices (admin + accountant)
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !["ADMIN", "ACCOUNTANT"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;
    const startDate = searchParams.get("startDate") ? new Date(searchParams.get("startDate")!) : undefined;
    const endDate = searchParams.get("endDate") ? new Date(searchParams.get("endDate")!) : undefined;

    const invoices = await prisma.invoice.findMany({
      where: {
        status: status || undefined,
        dueDate: startDate || endDate ? { gte: startDate, lte: endDate } : undefined,
      },
      select: {
        id: true,
        student: { select: { name: true } },
        amount: true,
        dueDate: true,
        status: true,
        createdAt: true,
      },
      orderBy: { dueDate: "desc" },
      take: 50, // limit for performance
    });

    return NextResponse.json(invoices);
  } catch (error) {
    console.error("GET /api/fees/invoices error:", error);
    return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 });
  }
}

// POST: Create new invoice (admin + accountant)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !["ADMIN", "ACCOUNTANT"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validated = createInvoiceSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const data = validated.data;

    const invoice = await prisma.invoice.create({
      data: {
        studentId: data.studentId,
        feeItemId: data.feeItemId || null,
        amount: data.amount,
        dueDate: data.dueDate,
        description: data.description?.trim(),
        status: "PENDING",
        createdById: session.user.id,
        approvedById: session.user.role === "ACCOUNTANT" ? session.user.id : null,
      },
    });

    return NextResponse.json({ success: true, invoice }, { status: 201 });
  } catch (error) {
    console.error("POST /api/fees/invoices error:", error);
    return NextResponse.json({ error: "Failed to create invoice" }, { status: 500 });
  }
}