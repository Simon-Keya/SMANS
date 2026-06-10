import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session || !["ADMIN", "ACCOUNTANT"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      select: {
        id: true,
        student: { select: { id: true, name: true } },
        feeItem: { select: { name: true } },
        amount: true,
        dueDate: true,
        status: true,
        description: true,
        createdAt: true,
        createdBy: { select: { name: true } },
        approvedBy: { select: { name: true } },
        payments: {
          select: {
            id: true,
            amount: true,
            method: true,
            status: true,
            paymentDate: true,
            createdBy: { select: { name: true } },
          },
          orderBy: { paymentDate: "desc" },
        },
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    return NextResponse.json(invoice);
  } catch (error) {
    console.error("GET /api/fees/invoices/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch invoice" }, { status: 500 });
  }
}