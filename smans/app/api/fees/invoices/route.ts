import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { InvoiceStatus } from "@prisma/client"; // Import the enum

const createInvoiceSchema = z.object({
  studentId: z.string().min(1),
  feeItemId: z.string().optional(),
  amount: z.number().positive(),
  dueDate: z.coerce.date(),
  // description removed - not in schema
});

// GET: List all invoices (admin + accountant)
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !["ADMIN", "ACCOUNTANT"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get("status");
    const startDate = searchParams.get("startDate") ? new Date(searchParams.get("startDate")!) : undefined;
    const endDate = searchParams.get("endDate") ? new Date(searchParams.get("endDate")!) : undefined;

    // Convert status string to enum if valid
    let statusFilter: InvoiceStatus | undefined;
    if (statusParam && Object.values(InvoiceStatus).includes(statusParam as InvoiceStatus)) {
      statusFilter = statusParam as InvoiceStatus;
    }

    const invoices = await prisma.invoice.findMany({
      where: {
        status: statusFilter,
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
        // description removed - not in schema
        status: InvoiceStatus.PENDING, // Use enum instead of string
        createdById: session.user.id,
        approvedById: session.user.role === "ACCOUNTANT" ? session.user.id : null,
      },
    });

    // Create audit log to track invoice creation
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "CREATE_INVOICE",
        entity: "Invoice",
        entityId: invoice.id,
        metadata: {
          studentId: data.studentId,
          feeItemId: data.feeItemId,
          amount: data.amount,
          dueDate: data.dueDate,
        },
      },
    });

    return NextResponse.json({ success: true, invoice }, { status: 201 });
  } catch (error) {
    console.error("POST /api/fees/invoices error:", error);
    return NextResponse.json({ error: "Failed to create invoice" }, { status: 500 });
  }
}