import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userRole = session.user.role as string | undefined;

  let students;

  if (userRole === "ADMIN" || userRole === "TEACHER") {
    students = await prisma.student.findMany({
      select: {
        id: true,
        name: true,
        admissionNumber: true, // ← Changed
        class: { select: { name: true } },
        email: true,
        parent: { select: { name: true, phone: true } },
      },
      orderBy: { admissionNumber: "asc" }, // ← Changed
    });
  } else if (userRole === "PARENT") {
    students = await prisma.student.findMany({
      where: { parent: { userId: session.user.id } },
      select: {
        id: true,
        name: true,
        admissionNumber: true, // ← Changed
        class: { select: { name: true } },
        email: true,
      },
      orderBy: { admissionNumber: "asc" }, // ← Changed
    });
  } else if (userRole === "STUDENT") {
    students = await prisma.student.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        name: true,
        admissionNumber: true, // ← Changed
        class: { select: { name: true } },
        email: true,
      },
    });
  } else {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({ success: true, data: students });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await request.json();

  if (!data.name || !data.admissionNumber || !data.classId) { // ← Changed
    return NextResponse.json({ error: "Missing required fields: name, admissionNumber, classId" }, { status: 400 });
  }

  const existing = await prisma.student.findUnique({
    where: { admissionNumber: data.admissionNumber }, // ← Changed
  });

  if (existing) {
    return NextResponse.json({ error: "Admission number already exists" }, { status: 409 });
  }

  const student = await prisma.student.create({
    data,
    include: { class: { select: { name: true } } },
  });

  return NextResponse.json({ success: true, data: student }, { status: 201 });
}