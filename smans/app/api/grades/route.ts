import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import * as z from "zod";

// Validation for creating grades
const createGradeSchema = z.object({
  studentId: z.string().min(1, "Student ID is required"),
  examId: z.string().min(1, "Exam ID is required"),
  grades: z.array(
    z.object({
      subjectId: z.string().min(1, "Subject ID is required"),
      marks: z.number().min(0, "Marks cannot be negative"),
      maxMarks: z.number().min(1, "Max marks must be greater than 0").optional(),
    })
  ).min(1, "At least one grade is required"),
});

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !["admin", "teacher"].includes(session.user?.role?.toLowerCase() ?? "")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const grades = await prisma.grade.findMany({
      include: {
        student: { select: { name: true } },
        subject: { select: { name: true } },
        exam: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },  // Now valid after adding field
      take: 50,
    });

    return NextResponse.json({ success: true, data: grades });
  } catch (error) {
    console.error("[GET_GRADES]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !["admin", "teacher"].includes(session.user?.role?.toLowerCase() ?? "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const parsed = createGradeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { studentId, examId, grades } = parsed.data;

    // Verify exam exists
    const exam = await prisma.exam.findUnique({ where: { id: examId } });
    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    const createdGrades = await prisma.$transaction(
      grades.map((g) =>
        prisma.grade.create({
          data: {
            studentId,
            examId,
            subjectId: g.subjectId,
            marks: g.marks,
            maxMarks: g.maxMarks || 100,
          },
        })
      )
    );

    return NextResponse.json({ success: true, data: createdGrades }, { status: 201 });
  } catch (error) {
    console.error("[CREATE_GRADES]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}