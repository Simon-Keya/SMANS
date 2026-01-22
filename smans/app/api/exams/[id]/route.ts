import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import * as z from "zod";

const updateExamSchema = z.object({
  title: z.string().min(3).trim().optional(),
  subjectId: z.string().optional(),
  classId: z.string().optional(),
  date: z.string().optional(),
  duration: z.number().min(15).optional(),
  maxScore: z.number().min(1).optional(),
});

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || !["admin", "teacher"].includes(session.user.role?.toLowerCase() ?? "")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const exam = await prisma.exam.findUnique({
      where: { id: params.id },
      include: {
        subject: { select: { name: true } },
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
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || !["admin", "teacher"].includes(session.user.role?.toLowerCase() ?? "")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = updateExamSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { date, ...rest } = parsed.data;

    const updated = await prisma.exam.update({
      where: { id: params.id },
      data: {
        ...rest,
        date: date ? new Date(date) : undefined,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("[UPDATE_EXAM]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || !["admin", "teacher"].includes(session.user.role?.toLowerCase() ?? "")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const exam = await prisma.exam.findUnique({
      where: { id: params.id },
    });

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    await prisma.exam.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: "Exam deleted" });
  } catch (error) {
    console.error("[DELETE_EXAM]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}