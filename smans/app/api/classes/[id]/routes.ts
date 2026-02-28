// app/api/classes/[id]/route.ts
import { authOptions } from "@/lib/auth/auth"; // FIXED: correct path
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const updateClassSchema = z.object({
  name: z.string().min(3).trim().optional(),
  level: z.string().min(1).trim().optional(),
  teacherId: z.string().optional().nullable(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const classRecord = await prisma.class.findUnique({
      where: { id: params.id },
      include: {
        teacher: { select: { name: true } },
        _count: { select: { students: true } },
      },
    });

    if (!classRecord) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        ...classRecord,
        studentCount: classRecord._count.students,
      },
    });
  } catch (error) {
    console.error("[GET_CLASS]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = updateClassSchema.safeParse(body);

    if (!parsed.success) {
      // FIXED: proper Zod error handling
      const firstError = parsed.error.issues[0];
      return NextResponse.json(
        { error: firstError?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const updatedClass = await prisma.class.update({
      where: { id: params.id },
      data: parsed.data,
      include: { teacher: { select: { name: true } } },
    });

    return NextResponse.json({ success: true, data: updatedClass });
  } catch (error) {
    console.error("[UPDATE_CLASS]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const classRecord = await prisma.class.findUnique({
      where: { id: params.id },
      include: { _count: { select: { students: true } } },
    });

    if (!classRecord) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    if (classRecord._count.students > 0) {
      return NextResponse.json(
        { error: "Cannot delete class with enrolled students" },
        { status: 409 }
      );
    }

    await prisma.class.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: "Class deleted" });
  } catch (error) {
    console.error("[DELETE_CLASS]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}