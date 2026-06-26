// app/api/fees/invoices/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { requireRole, type AppRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // ✅ FIX: Pass roles as an array
    await requireRole(["ADMIN", "ACCOUNTANT"] as AppRole[]);

    const { id } = await params;

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        student: {
          include: {
            user: true,
          },
        },
        feeItem: true, // ✅ Fixed: Changed from 'fees' to 'feeItem'
        payments: {
          select: {
            id: true,
            amount: true,
            status: true,
            paymentDate: true,
            method: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        approvedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!invoice) {
      return NextResponse.json(
        { error: "Invoice not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(invoice);
  } catch (error) {
    console.error("Error fetching invoice:", error);
    return NextResponse.json(
      { error: "Failed to fetch invoice" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // ✅ FIX: Pass roles as an array
    await requireRole(["ADMIN", "ACCOUNTANT"] as AppRole[]);

    const { id } = await params;
    const body = await req.json();
    const { status, amountPaid, paymentDate, feeItemId, studentId } = body;

    // Prepare update data
    const updateData: any = {};
    if (status) updateData.status = status;
    if (amountPaid !== undefined) updateData.amountPaid = amountPaid;
    if (paymentDate) updateData.paymentDate = new Date(paymentDate);
    if (feeItemId) updateData.feeItemId = feeItemId;
    if (studentId) updateData.studentId = studentId;

    // If status is PAID, set payment date to now if not provided
    if (status === "PAID" && !paymentDate) {
      updateData.paymentDate = new Date();
    }

    const invoice = await prisma.invoice.update({
      where: { id },
      data: updateData,
      include: {
        student: {
          include: {
            user: true,
          },
        },
        feeItem: true,
        payments: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
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

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // ✅ FIX: Pass roles as an array
    await requireRole(["ADMIN"] as AppRole[]);

    const { id } = await params;

    // Check if invoice has payments before deleting
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        payments: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!invoice) {
      return NextResponse.json(
        { error: "Invoice not found" },
        { status: 404 }
      );
    }

    // If invoice has payments, don't allow deletion
    if (invoice.payments.length > 0) {
      return NextResponse.json(
        { 
          error: "Cannot delete invoice with existing payments",
          paymentsCount: invoice.payments.length 
        },
        { status: 400 }
      );
    }

    await prisma.invoice.delete({
      where: { id },
    });

    return NextResponse.json(
      { 
        success: true,
        message: "Invoice deleted successfully" 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting invoice:", error);
    return NextResponse.json(
      { error: "Failed to delete invoice" },
      { status: 500 }
    );
  }
}