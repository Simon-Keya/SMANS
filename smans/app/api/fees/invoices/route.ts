// app/api/fees/invoices/route.ts
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
    const { studentId, amount, dueDate, description, feeItemId } = body;

    // Validate required fields
    if (!studentId || !amount || !dueDate) {
      return NextResponse.json(
        { error: "Missing required fields: studentId, amount, dueDate" },
        { status: 400 }
      );
    }

    // Validate student exists
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }

    // If feeItemId is provided, validate it exists
    if (feeItemId) {
      const feeItem = await prisma.feeItem.findUnique({
        where: { id: feeItemId },
      });

      if (!feeItem) {
        return NextResponse.json(
          { error: "Fee item not found" },
          { status: 404 }
        );
      }
    }

    const invoice = await prisma.invoice.create({
      data: {
        studentId,
        amount,
        dueDate: new Date(dueDate),
        description,
        status: "PENDING",
        createdById: session.user.id,
        feeItemId: feeItemId || null, // Link to fee item if provided
      },
      include: {
        student: {
          include: {
            user: true,
          },
        },
        feeItem: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(
      { 
        success: true, 
        message: "Invoice created successfully",
        data: invoice 
      },
      { status: 201 }
    );
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

    // Check if invoice exists
    const existingInvoice = await prisma.invoice.findUnique({
      where: { id },
      select: { 
        studentId: true,
        status: true,
      },
    });

    if (!existingInvoice) {
      return NextResponse.json(
        { error: "Invoice not found" },
        { status: 404 }
      );
    }

    const userRole = session.user.role as string;
    const hasPermission = 
      userRole === "ADMIN" || 
      userRole === "ACCOUNTANT";

    // Check permissions
    if (!hasPermission) {
      // Students can only update their own invoices (e.g., make payment)
      if (userRole === "STUDENT") {
        // Get the student ID from the session user
        const student = await prisma.student.findUnique({
          where: { userId: session.user.id },
          select: { id: true },
        });

        if (!student || student.id !== existingInvoice.studentId) {
          return NextResponse.json(
            { error: "Forbidden - You can only update your own invoices" },
            { status: 403 }
          );
        }
        
        // Students can only update payment-related fields
        if (status && status !== "PAID" && status !== "PARTIAL") {
          return NextResponse.json(
            { error: "Students can only update payment status to PAID or PARTIAL" },
            { status: 403 }
          );
        }
      } else {
        return NextResponse.json(
          { error: "Forbidden - Insufficient permissions" },
          { status: 403 }
        );
      }
    }

    // Prepare update data
    const updateData: any = {};
    if (status) updateData.status = status;
    if (amountPaid !== undefined) updateData.amountPaid = amountPaid;
    if (paymentDate) updateData.paymentDate = new Date(paymentDate);
    
    // Auto-set payment date if status is PAID and no payment date provided
    if (status === "PAID" && !paymentDate) {
      updateData.paymentDate = new Date();
    }

    // If status is PENDING, clear payment date
    if (status === "PENDING") {
      updateData.paymentDate = null;
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
      },
    });

    return NextResponse.json({
      success: true,
      message: "Invoice updated successfully",
      data: invoice,
    });
  } catch (error) {
    console.error("Error updating invoice:", error);
    return NextResponse.json(
      { error: "Failed to update invoice" },
      { status: 500 }
    );
  }
}