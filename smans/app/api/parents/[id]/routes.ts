// app/api/parents/[id]/route.ts
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const updateParentSchema = z.object({
  name: z.string().min(2).trim().optional(),
  email: z.string().email().trim().toLowerCase().optional(),
  phone: z.string().min(9).trim().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    
    const parent = await prisma.parent.findUnique({
      where: { id },
      include: {
        students: {
          select: { 
            id: true, 
            name: true, 
            admissionNumber: true
          },
        },
        user: { select: { email: true } },
      },
    });

    if (!parent) {
      return NextResponse.json({ error: "Parent not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: parent });
  } catch (error) {
    console.error("[GET_PARENT]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = updateParentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const { email } = parsed.data;

    // Prevent email conflict
    if (email) {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      const existingParent = await prisma.parent.findFirst({
        where: { email, id: { not: id } },
      });

      if (existingUser || existingParent) {
        return NextResponse.json({ error: "Email already in use" }, { status: 409 });
      }
    }

    const updated = await prisma.parent.update({
      where: { id },
      data: parsed.data,
      include: {
        students: { 
          select: { id: true, name: true, admissionNumber: true }
        },
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("[UPDATE_PARENT]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    
    const parent = await prisma.parent.findUnique({
      where: { id },
      include: { students: true },
    });

    if (!parent) {
      return NextResponse.json({ error: "Parent not found" }, { status: 404 });
    }

    if (parent.students.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete parent with linked students" },
        { status: 409 }
      );
    }

    // Delete linked user if exists
    if (parent.userId) {
      await prisma.user.delete({ where: { id: parent.userId } });
    }

    await prisma.parent.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Parent deleted successfully" });
  } catch (error) {
    console.error("[DELETE_PARENT]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}