// app/api/students/route.ts
import { authOptions } from "@/lib/auth/auth"; // FIXED: correct path
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userRole = session.user.role as string | undefined;

  try {
    let students;

    if (userRole === "ADMIN" || userRole === "TEACHER") {
      // Admins & teachers see all students
      students = await prisma.student.findMany({
        select: {
          id: true,
          name: true,
          rollNumber: true,
          class: { select: { name: true } },
          email: true,
          parent: { select: { name: true, phone: true } },
        },
        orderBy: { rollNumber: "asc" },
      });
    } else if (userRole === "PARENT") {
      // Parents only see their own children
      students = await prisma.student.findMany({
        where: { parent: { userId: session.user.id } },
        select: {
          id: true,
          name: true,
          rollNumber: true,
          class: { select: { name: true } },
          email: true,
        },
        orderBy: { rollNumber: "asc" },
      });
    } else if (userRole === "STUDENT") {
      // Students only see themselves
      students = await prisma.student.findMany({
        where: { userId: session.user.id },
        select: {
          id: true,
          name: true,
          rollNumber: true,
          class: { select: { name: true } },
          email: true,
        },
      });
    } else {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ success: true, data: students });
  } catch (error) {
    console.error("[GET_STUDENTS]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();

    // Basic validation (you can expand with Zod later)
    if (!data.name || !data.rollNumber || !data.classId) {
      return NextResponse.json({ error: "Missing required fields: name, rollNumber, classId" }, { status: 400 });
    }

    // Optional: check if rollNumber is unique
    const existing = await prisma.student.findUnique({
      where: { rollNumber: data.rollNumber },
    });

    if (existing) {
      return NextResponse.json({ error: "Roll number already exists" }, { status: 409 });
    }

    const student = await prisma.student.create({
      data,
      include: {
        class: { select: { name: true } },
      },
    });

    return NextResponse.json({ success: true, data: student }, { status: 201 });
  } catch (error) {
    console.error("[CREATE_STUDENT]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}