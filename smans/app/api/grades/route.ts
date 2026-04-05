// app/api/grades/route.ts
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

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

  if (!session || !["ADMIN", "TEACHER"].includes(session.user.role as string)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const grades = await prisma.grade.findMany({
      include: {
        student: { select: { name: true, admissionNumber: true } }, // ← Changed
        subject: { select: { name: true, code: true } },
        exam: { select: { name: true, date: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ success: true, data: grades });
  } catch (error) {
    console.error("[GET_GRADES]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !["ADMIN", "TEACHER"].includes(session.user.role as string)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const parsed = createGradeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { studentId, examId, grades } = parsed.data;

    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const exam = await prisma.exam.findUnique({
      where: { id: examId },
    });

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    const subjectIds = grades.map((g) => g.subjectId);
    const validSubjects = await prisma.subject.findMany({
      where: {
        id: { in: subjectIds },
        classes: { some: { id: student.classId } },
      },
      select: { id: true },
    });

    const validSubjectIds = new Set(validSubjects.map((s) => s.id));

    const validGrades = grades.filter((g) => validSubjectIds.has(g.subjectId));

    if (validGrades.length === 0) {
      return NextResponse.json({ error: "No valid subjects found for this class" }, { status: 400 });
    }

    const createdGrades = await prisma.$transaction(
      validGrades.map((g) =>
        prisma.grade.create({
          data: {
            studentId,
            examId,
            subjectId: g.subjectId,
            marks: g.marks,
            maxMarks: g.maxMarks || 100,
          },
          include: {
            student: { select: { name: true, admissionNumber: true } }, // ← Changed
            subject: { select: { name: true } },
            exam: { select: { name: true } },
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