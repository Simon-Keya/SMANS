// app/api/subjects/route.ts
import { authOptions } from "@/lib/auth/auth"; // FIXED: correct path
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const createSubjectSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").trim(),
  code: z.string().min(2, "Code must be at least 2 characters").trim().toUpperCase(),
  description: z.string().optional(),
});

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const subjects = await prisma.subject.findMany({
      include: {
        classes: { select: { name: true } },
        _count: { select: { classes: true } },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({
      success: true,
      data: subjects.map(s => ({
        ...s,
        classCount: s._count.classes,
      })),
    });
  } catch (error) {
    console.error("[GET_SUBJECTS]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = createSubjectSchema.safeParse(body);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return NextResponse.json(
        { error: firstIssue?.message || "Invalid input" },
        { status: 400 }
      );
    }

    // Optional: check if code already exists (unique constraint)
    const existing = await prisma.subject.findUnique({
      where: { code: parsed.data.code },
    });

    if (existing) {
      return NextResponse.json({ error: "Subject code already exists" }, { status: 409 });
    }

    const newSubject = await prisma.subject.create({
      data: parsed.data,
    });

    return NextResponse.json({ success: true, data: newSubject }, { status: 201 });
  } catch (error) {
    console.error("[CREATE_SUBJECT]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}