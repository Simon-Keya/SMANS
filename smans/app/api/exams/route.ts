// app/api/exams/route.ts
import { authOptions } from "@/lib/auth/auth"; // FIXED: correct path
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const createExamSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").trim(),
  subjectId: z.string().min(1, "Subject is required"),
  classId: z.string().min(1, "Class is required"),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
  duration: z.number().min(15, "Duration must be at least 15 minutes"),
  maxScore: z.number().min(1, "Max score must be greater than 0"),
});

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !["ADMIN", "TEACHER"].includes(session.user.role as string)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const exams = await prisma.exam.findMany({
      include: {
        subject: { select: { name: true } },
        class: { select: { name: true } },
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json({ success: true, data: exams });
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
      // FIXED: proper Zod error handling
      const firstIssue = parsed.error.issues[0];
      return NextResponse.json(
        { error: firstIssue?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { name, subjectId, classId, date, duration, maxScore } = parsed.data;

    // Verify subject and class exist
    const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
    const cls = await prisma.class.findUnique({ where: { id: classId } });

    if (!subject || !cls) {
      return NextResponse.json({ error: "Subject or class not found" }, { status: 404 });
    }

    const exam = await prisma.exam.create({
      data: {
        name,
        subjectId,
        classId,
        date: new Date(date),
        duration,
        maxScore,
      },
    });

    return NextResponse.json({ success: true, data: exam }, { status: 201 });
  } catch (error) {
    console.error("[CREATE_EXAM]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}