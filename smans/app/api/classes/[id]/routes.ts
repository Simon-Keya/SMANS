// app/api/classes/[id]/route.ts
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const updateClassSchema = z.object({
  name: z.string().min(3).trim().optional(),
  level: z.string().min(1).trim().optional(),
  teacherId: z.string().optional().nullable(),
});

// ✅ PUBLIC - No authentication required for viewing class details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const classRecord = await prisma.class.findUnique({
      where: { id },
      include: {
        teacher: { select: { id: true, name: true } },
        _count: { select: { students: true } },
      },
    });

    if (!classRecord) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: classRecord.id,
        name: classRecord.name,
        level: classRecord.level,
        teacher: classRecord.teacher,
        studentCount: classRecord._count.students,
      },
    });
  } catch (error) {
    console.error("[GET_CLASS]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ✅ PUT - Protected (Admin only)
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
    const parsed = updateClassSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return NextResponse.json(
        { error: firstError?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (parsed.data.name !== undefined) updateData.name = parsed.data.name;
    if (parsed.data.level !== undefined) updateData.level = parsed.data.level;
    if (parsed.data.teacherId !== undefined) updateData.teacherId = parsed.data.teacherId || null;

    const updatedClass = await prisma.class.update({
      where: { id },
      data: updateData,
      include: { 
        teacher: { select: { id: true, name: true } } 
      },
    });

    return NextResponse.json({ success: true, data: updatedClass });
  } catch (error) {
    console.error("[UPDATE_CLASS]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ✅ DELETE - Protected (Admin only)
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
    
    const classRecord = await prisma.class.findUnique({
      where: { id },
      include: { _count: { select: { students: true } } },
    });

    if (!classRecord) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    if (classRecord._count.students > 0) {
      return NextResponse.json(
        { error: `Cannot delete class with ${classRecord._count.students} enrolled students. Please reassign students first.` },
        { status: 409 }
      );
    }

    await prisma.class.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Class deleted successfully" });
  } catch (error) {
    console.error("[DELETE_CLASS]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}