// app/api/fees/structure/[id]/route.ts
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireRole, type AppRole } from "@/lib/permissions";

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

    // ✅ FIX: Pass roles as an array with type assertion (same as invoice route)
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
      select: {
        id: true,
        name: true,
        amount: true,
        frequency: true,
        description: true,
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

    // ✅ FIX: Pass roles as an array with type assertion (same as invoice route)
    await requireRole(["ADMIN", "ACCOUNTANT"] as AppRole[]);
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

    const data = validated.data;

    const feeItem = await prisma.feeItem.update({
      where: { id },
      data: {
        name: data.name ? data.name.trim() : undefined,
        amount: data.amount,
        frequency: data.frequency,
        description: data.description,
      },
    });

    return NextResponse.json({ success: true, feeItem });
  } catch (error) {
    console.error("PATCH /api/fees/structure/[id] error:", error);
    return NextResponse.json({ error: "Failed to update fee item" }, { status: 500 });
  }
}