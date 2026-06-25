import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { requireRole, type AppRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateFeeItemSchema = z.object({
  name: z.string().min(1).optional(),
  amount: z.number().positive().optional(),
  frequency: z.enum(["ONCE", "MONTHLY", "TERM", "YEARLY"]).optional(),
  description: z.string().optional().nullable(),
});

// GET: Fetch single fee item
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

    // ✅ Only ADMIN and ACCOUNTANT can view fee items
    await requireRole(["ADMIN", "ACCOUNTANT"] as AppRole[]);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;
    
    const feeItem = await prisma.feeItem.findUnique({
      where: { id },
      include: {
        invoices: {
          select: {
            id: true,
            status: true,
            amount: true,
            dueDate: true,
            student: {
              select: {
                id: true,
                name: true,
                admissionNumber: true,
              },
            },
          },
        },
      },
    });

    if (!feeItem) {
      return NextResponse.json({ error: "Fee item not found" }, { status: 404 });
    }

    return NextResponse.json(feeItem);
  } catch (error) {
    console.error("GET /api/fees/structure/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch fee item" }, { status: 500 });
  }
}

// PATCH: Update fee item
export async function PATCH(
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

    // ✅ Only ADMIN can update fee items
    await requireRole(["ADMIN"] as AppRole[]);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const validated = updateFeeItemSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    // Check if fee item exists
    const existing = await prisma.feeItem.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Fee item not found" }, { status: 404 });
    }

    const data = validated.data;

    const feeItem = await prisma.feeItem.update({
      where: { id },
      data: {
        name: data.name ? data.name.trim() : undefined,
        amount: data.amount,
        frequency: data.frequency,
        description: data.description !== undefined ? data.description : undefined,
      },
    });

    return NextResponse.json({ success: true, feeItem });
  } catch (error) {
    console.error("PATCH /api/fees/structure/[id] error:", error);
    return NextResponse.json({ error: "Failed to update fee item" }, { status: 500 });
  }
}

// DELETE: Delete fee item
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

    // ✅ Only ADMIN can delete fee items
    await requireRole(["ADMIN"] as AppRole[]);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;

    // Check if fee item exists
    const existing = await prisma.feeItem.findUnique({
      where: { id },
      include: {
        invoices: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Fee item not found" }, { status: 404 });
    }

    // Check if fee item is linked to any invoices
    if (existing.invoices.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete fee item as it is linked to existing invoices" },
        { status: 400 }
      );
    }

    await prisma.feeItem.delete({
      where: { id },
    });

    return NextResponse.json(
      { success: true, message: "Fee item deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE /api/fees/structure/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete fee item" }, { status: 500 });
  }
}