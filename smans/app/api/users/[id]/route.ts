import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userRole = session.user.role as string | undefined;

  const student = await prisma.student.findUnique({
    where: { id: params.id },
    include: {
      class: { select: { name: true } },
      parent: { select: { name: true, phone: true, userId: true } },
      user: { select: { email: true } },
    },
  });

  if (!student) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  // Access control
  const canAccess =
    userRole === "ADMIN" ||
    userRole === "TEACHER" ||
    student.parent?.userId === session.user.id ||
    student.userId === session.user.id;

  if (!canAccess) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({ success: true, data: student });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized: Only admins can update students" }, { status: 401 });
  }

  try {
    const data = await request.json();

    // Basic validation
    if (!data.name || !data.admissionNumber || !data.classId) {
      return NextResponse.json(
        { error: "Missing required fields: name, admissionNumber, classId" },
        { status: 400 }
      );
    }

    // Check if student exists
    const existingStudent = await prisma.student.findUnique({
      where: { id: params.id },
    });

    if (!existingStudent) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Check admission number uniqueness (if changed)
    if (data.admissionNumber !== existingStudent.admissionNumber) {
      const duplicate = await prisma.student.findUnique({
        where: { admissionNumber: data.admissionNumber },
      });

      if (duplicate) {
        return NextResponse.json({ error: "Admission number already exists" }, { status: 409 });
      }
    }

    const updatedStudent = await prisma.student.update({
      where: { id: params.id },
      data: {
        name: data.name.trim(),
        admissionNumber: data.admissionNumber.trim(),
        email: data.email?.trim() || null,
        phone: data.phone?.trim() || null,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        gender: data.gender || null,
        address: data.address?.trim() || null,
        classId: data.classId,
        parentId: data.parentId || null,
      },
      include: {
        class: { select: { name: true } },
        parent: { select: { name: true, phone: true } },
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "UPDATE_STUDENT",
        entity: "Student",
        entityId: params.id,
        metadata: {
          admissionNumber: updatedStudent.admissionNumber,
          classId: updatedStudent.classId,
        },
      },
    });

    return NextResponse.json({ success: true, data: updatedStudent });
  } catch (error: any) {
    console.error("[UPDATE_STUDENT]", error);

    if (error.code === "P2002") {
      return NextResponse.json({ error: "Admission number already in use" }, { status: 409 });
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized: Only admins can delete students" }, { status: 401 });
  }

  try {
    const student = await prisma.student.findUnique({
      where: { id: params.id },
      include: {
        parent: { select: { userId: true } },
        user: { select: { id: true } }, // linked user account if exists
      },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Optional safety: Prevent deleting if student has important records
    const hasGrades = await prisma.grade.count({ where: { studentId: params.id } });
    const hasAttendance = await prisma.attendance.count({ where: { studentId: params.id } });

    if (hasGrades > 0 || hasAttendance > 0) {
      return NextResponse.json(
        { error: "Cannot delete student with existing grades or attendance records" },
        { status: 403 }
      );
    }

    // Delete student
    await prisma.student.delete({
      where: { id: params.id },
    });

    // If student has a linked user account, delete it too (optional but common)
    if (student.user?.id) {
      await prisma.user.delete({
        where: { id: student.user.id },
      });
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "DELETE_STUDENT",
        entity: "Student",
        entityId: params.id,
        metadata: {
          admissionNumber: student.admissionNumber,
          name: student.name,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: `Student ${student.admissionNumber} deleted successfully`,
    });
  } catch (error: any) {
    console.error("[DELETE_STUDENT]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}