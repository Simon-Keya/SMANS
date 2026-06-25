import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { requireRole, type AppRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await requireRole(["ADMIN", "ACCOUNTANT"] as AppRole[]);

    const searchParams = req.nextUrl.searchParams;
    const studentId = searchParams.get("studentId");
    const status = searchParams.get("status");
    const fromDate = searchParams.get("fromDate");
    const toDate = searchParams.get("toDate");

    const where: any = {};
    
    if (studentId) where.studentId = studentId;
    if (status) where.status = status;
    if (fromDate || toDate) {
      where.createdAt = {};
      if (fromDate) where.createdAt.gte = new Date(fromDate);
      if (toDate) where.createdAt.lte = new Date(toDate);
    }

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        student: {
          include: {
            user: true,
          },
        },
        fees: true, // ✅ Make sure this matches your schema (could be "feeItems" or "fee")
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(invoices);
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return NextResponse.json(
      { error: "Failed to fetch invoices" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await requireRole(["ADMIN", "ACCOUNTANT"] as AppRole[]);

    const body = await req.json();
    const { studentId, amount, dueDate, description, feeIds } = body;

    if (!studentId || !amount || !dueDate) {
      return NextResponse.json(
        { error: "Missing required fields: studentId, amount, dueDate" },
        { status: 400 }
      );
    }

    const invoice = await prisma.$transaction(async (tx) => {
      const newInvoice = await tx.invoice.create({
        data: {
          studentId,
          amount,
          dueDate: new Date(dueDate),
          description,
          status: "PENDING",
          createdById: session.user.id,
        },
      });

      // ✅ FIX: Use the correct model name from your schema
      if (feeIds && feeIds.length > 0) {
        await tx.feeItem.updateMany({  // ← Change this to match your schema
          where: {
            id: { in: feeIds },
            studentId,
          },
          data: {
            invoiceId: newInvoice.id,
            status: "INVOICED",
          },
        });
      }

      return newInvoice;
    });

    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    console.error("Error creating invoice:", error);
    return NextResponse.json(
      { error: "Failed to create invoice" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { id, status, amountPaid, paymentDate, studentId } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Invoice ID required" },
        { status: 400 }
      );
    }

    const userRole = session.user.role as string;
    const hasPermission = 
      userRole === "ADMIN" || 
      userRole === "ACCOUNTANT";

    if (!hasPermission) {
      if (userRole === "STUDENT" && studentId && session.user.id === studentId) {
        const invoice = await prisma.invoice.findUnique({
          where: { id },
          select: { studentId: true },
        });

        if (!invoice || invoice.studentId !== session.user.id) {
          return NextResponse.json(
            { error: "Forbidden" },
            { status: 403 }
          );
        }
      } else {
        return NextResponse.json(
          { error: "Forbidden" },
          { status: 403 }
        );
      }
    }

    const invoice = await prisma.invoice.update({
      where: { id },
      data: {
        status,
        amountPaid,
        paymentDate: paymentDate ? new Date(paymentDate) : null,
      },
    });

    return NextResponse.json(invoice);
  } catch (error) {
    console.error("Error updating invoice:", error);
    return NextResponse.json(
      { error: "Failed to update invoice" },
      { status: 500 }
    );
  }
}