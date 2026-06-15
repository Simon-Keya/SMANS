// app/api/classes/route.ts
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const createClassSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").trim(),
  level: z.string().min(1, "Level/Grade is required").trim(),
  teacherId: z.string().optional().nullable(),
});

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const classes = await prisma.class.findMany({
      include: {
        teacher: { select: { id: true, name: true } },
        _count: { select: { students: true } },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({
      success: true,
      data: classes.map(cls => ({
        ...cls,
        studentCount: cls._count.students,
      })),
    });
  } catch (error) {
    console.error("[GET_CLASSES]", error);
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
    const parsed = createClassSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return NextResponse.json(
        { error: firstError?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const newClass = await prisma.class.create({
      data: {
        name: parsed.data.name,
        level: parsed.data.level,
        teacherId: parsed.data.teacherId || null,   // ← Fixed
      },
      include: {
        teacher: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ success: true, data: newClass }, { status: 201 });
  } catch (error) {
    console.error("[CREATE_CLASS]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}