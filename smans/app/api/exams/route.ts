import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import * as z from "zod";

const createExamSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").trim(),
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

  if (!session || !["admin", "teacher"].includes(session.user.role?.toLowerCase() ?? "")) {
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

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !["admin", "teacher"].includes(session.user.role?.toLowerCase() ?? "")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = createExamSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { title, subjectId, classId, date, duration, maxScore } = parsed.data;

    // Verify subject and class exist
    const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
    const cls = await prisma.class.findUnique({ where: { id: classId } });

    if (!subject || !cls) {
      return NextResponse.json({ error: "Subject or class not found" }, { status: 404 });
    }

    const exam = await prisma.exam.create({
      data: {
        title,
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