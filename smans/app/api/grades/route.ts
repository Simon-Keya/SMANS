import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  const userRole = session?.user?.role as string | undefined;

  if (!session || !userRole || !["admin", "teacher", "parent", "student"].includes(userRole)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const grades = await prisma.grade.findMany({
    include: { student: { select: { name: true } } },
  });

  return NextResponse.json(grades);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const userRole = session?.user?.role as string | undefined;

  if (!session || !userRole || !["admin", "teacher"].includes(userRole)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { studentId, examName, grades } = await request.json();

  const created = await prisma.$transaction(
    grades.map((g: any) =>
      prisma.grade.create({
        data: {
          studentId,
          examName,
          subject: g.subject,
          marks: g.marks,
          maxMarks: g.maxMarks || 100,
        },
      })
    )
  );

  return NextResponse.json(created, { status: 201 });
}