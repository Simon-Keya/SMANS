// app/api/attendance/[id]/route.ts
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const record = await prisma.attendance.findUnique({
    where: { id: params.id },
    include: {
      student: {
        select: { 
          name: true, 
          admissionNumber: true,   // ← Changed from rollNumber
          class: { select: { name: true } } 
        },
      },
    },
  });

  if (!record) {
    return NextResponse.json({ error: "Attendance record not found" }, { status: 404 });
  }

  return NextResponse.json(record);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  const userRole = session?.user?.role as string | undefined;

  if (!session || !userRole || !["ADMIN", "TEACHER"].includes(userRole)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const data = await request.json();

    const allowedFields = ["status"];
    const updateData = Object.fromEntries(
      Object.entries(data).filter(([key]) => allowedFields.includes(key))
    );

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const updated = await prisma.attendance.update({
      where: { id: params.id },
      data: updateData,
      include: { 
        student: { 
          select: { name: true, admissionNumber: true }   // ← Changed
        } 
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Attendance update error:", error);
    return NextResponse.json({ error: "Failed to update attendance" }, { status: 500 });
  }
}