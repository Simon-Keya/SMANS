// app/api/grades/[id]/route.ts
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/permissions";

const updateGradeSchema = z.object({
  marks: z.number().min(0, "Marks cannot be negative").optional(),
  maxMarks: z.number().min(1, "Max marks must be greater than 0").optional(),
  published: z.boolean().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ Allow ADMIN and TEACHER to view grades
    // Fix: Pass roles as an array
    await requireRole(["ADMIN", "TEACHER"]);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;
    
    const grade = await prisma.grade.findUnique({
      where: { id },
      include: {
        student: { select: { name: true, admissionNumber: true } },
        subject: { select: { name: true, code: true } },
        exam: { select: { name: true, date: true } },
      },
    });

    if (!grade) {
      return NextResponse.json({ error: "Grade not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: grade });
  } catch (error) {
    console.error("[GET_GRADE]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ Only ADMIN and TEACHER can update grades
    await requireRole(["ADMIN", "TEACHER"]);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = updateGradeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const existing = await prisma.grade.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Grade not found" }, { status: 404 });
    }

    const updated = await prisma.grade.update({
      where: { id },
      data: parsed.data,
      include: {
        student: { select: { name: true, admissionNumber: true } },
        subject: { select: { name: true } },
        exam: { select: { name: true } },
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("[UPDATE_GRADE]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ Only ADMIN can delete grades
    await requireRole(["ADMIN"]);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;
    
    const grade = await prisma.grade.findUnique({
      where: { id },
    });

    if (!grade) {
      return NextResponse.json({ error: "Grade not found" }, { status: 404 });
    }

    await prisma.grade.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Grade deleted" });
  } catch (error) {
    console.error("[DELETE_GRADE]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}