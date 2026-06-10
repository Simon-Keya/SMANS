// app/api/exams/[id]/route.ts
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const updateExamSchema = z.object({
  name: z.string().min(3).trim().optional(),
  subjectId: z.string().optional(),
  classId: z.string().optional(),
  date: z.string().optional(),
  duration: z.number().min(15).optional(),
  maxScore: z.number().min(1).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session || !["ADMIN", "TEACHER"].includes(session.user.role as string)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    
    const exam = await prisma.exam.findUnique({
      where: { id },
      include: {
        subject: { select: { name: true, code: true } },
        class: { select: { name: true } },
      },
    });

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: exam });
  } catch (error) {
    console.error("[GET_EXAM]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session || !["ADMIN", "TEACHER"].includes(session.user.role as string)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = updateExamSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const { date, ...rest } = parsed.data;

    const updated = await prisma.exam.update({
      where: { id },
      data: {
        ...rest,
        date: date ? new Date(date) : undefined,
      },
      include: {
        subject: { select: { name: true } },
        class: { select: { name: true } },
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("[UPDATE_EXAM]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session || !["ADMIN", "TEACHER"].includes(session.user.role as string)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    
    const exam = await prisma.exam.findUnique({
      where: { id },
      select: { id: true, name: true },
    });

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    const relatedGradesCount = await prisma.grade.count({
      where: { examId: id },
    });

    if (relatedGradesCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete exam. It has ${relatedGradesCount} recorded grades.` },
        { status: 400 }
      );
    }

    await prisma.exam.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Exam deleted successfully" });
  } catch (error) {
    console.error("[DELETE_EXAM]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}