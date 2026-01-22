import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import * as z from "zod";

const createClassSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").trim(),
  level: z.string().min(1, "Level/Grade is required").trim(),
  teacherId: z.string().optional(),
});

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const classes = await prisma.class.findMany({
      include: {
        teacher: { select: { name: true } },
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

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = createClassSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const newClass = await prisma.class.create({
      data: parsed.data,
    });

    return NextResponse.json({ success: true, data: newClass }, { status: 201 });
  } catch (error) {
    console.error("[CREATE_CLASS]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}