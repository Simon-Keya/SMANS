import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);

  // Safely extract role with fallback
  const userRole = session?.user?.role as string | undefined;

  if (!session || !userRole || !["admin", "teacher", "parent", "student"].includes(userRole)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const students = await prisma.student.findMany({
    select: {
      id: true,
      name: true,
      rollNumber: true,
      class: true,
      email: true,
      parentPhone: true,
    },
    orderBy: { rollNumber: "asc" },
  });

  return NextResponse.json(students);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  // Safely extract role with fallback
  const userRole = session?.user?.role as string | undefined;

  if (!session || !userRole || !["admin", "teacher"].includes(userRole)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const data = await request.json();

  const student = await prisma.student.create({
    data,
  });

  return NextResponse.json(student, { status: 201 });
}