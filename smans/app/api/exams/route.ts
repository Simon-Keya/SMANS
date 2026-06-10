// app/api/exams/route.ts
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const createExamSchema = z.object({
  name: z.string().min(3, "Exam name must be at least 3 characters").trim(),
  subjectId: z.string().min(1, "Subject is required"),
  classId: z.string().min(1, "Class is required"),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date format" }),
  duration: z.number().min(15).optional().default(120),
  maxScore: z.number().min(1).optional().default(100),
});

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !["ADMIN", "TEACHER"].includes(session.user.role as string)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const exams = await prisma.exam.findMany({
      include: {
        class: { select: { name: true } },
        grades: {
          include: {
            subject: { select: { name: true, code: true } }
          },
          distinct: ['subjectId'], // Get unique subjects per exam
        }
      },
      orderBy: { date: "desc" },
    });

    // Transform the response to include subject from grades
    const examsWithSubject = exams.map(exam => {
      const { grades, ...examData } = exam;
      const subject = grades[0]?.subject || null;
      return {
        ...examData,
        subject,
      };
    });

    return NextResponse.json({ success: true, data: examsWithSubject });
  } catch (error) {
    console.error("[GET_EXAMS]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !["ADMIN", "TEACHER"].includes(session.user.role as string)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = createExamSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const { name, subjectId, classId, date, duration, maxScore } = parsed.data;

    const [subject, cls] = await Promise.all([
      prisma.subject.findUnique({ where: { id: subjectId } }),
      prisma.class.findUnique({ where: { id: classId } }),
    ]);

    if (!subject || !cls) {
      return NextResponse.json({ error: "Subject or class not found" }, { status: 404 });
    }

    // Since Exam doesn't have subjectId field, we need to adjust
    // Option 1: Create exam without subjectId (if your schema allows)
    const exam = await prisma.exam.create({
      data: {
        name: name.trim(),
        classId,
        date: new Date(date),
        // subjectId is not in the Exam model
        // duration and maxScore are not in the Exam model
      },
      include: {
        class: { select: { name: true } },
      },
    });

    // Option 2: Create grades for this exam with the subject
    // This would link the exam to the subject through grades
    // You might want to create placeholder grades or handle this differently

    return NextResponse.json({ 
      success: true, 
      data: exam,
      warning: "Subject association requires creating grades" 
    }, { status: 201 });
  } catch (error) {
    console.error("[CREATE_EXAM]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}