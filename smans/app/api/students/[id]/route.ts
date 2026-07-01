// app/api/students/[id]/route.ts
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const userRole = session.user.role as string | undefined;

    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        class: { 
          select: { 
            id: true,
            name: true, 
            level: true 
          } 
        },
        parent: { 
          select: { 
            id: true,
            name: true, 
            phone: true, 
            userId: true,
            email: true,
            occupation: true,
            relationship: true,
          } 
        },
        user: { 
          select: { 
            id: true,
            email: true,
            name: true,
            phone: true,
            isActive: true,
          } 
        },
        grades: {
          take: 5,
          orderBy: { createdAt: "desc" },
          include: {
            subject: { select: { name: true, code: true } },
            exam: { select: { name: true, term: true, year: true } },
          },
        },
        attendance: {
          take: 10,
          orderBy: { date: "desc" },
        },
        invoices: {
          where: { status: { not: "PAID" } },
          orderBy: { dueDate: "asc" },
          take: 3,
        },
        _count: {
          select: {
            grades: true,
            attendance: true,
            invoices: true,
          },
        },
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

    // Include a flag for unassigned students
    const responseData = {
      ...student,
      isUnassigned: !student.classId,
    };

    return NextResponse.json({ success: true, data: responseData });
  } catch (error) {
    console.error("[GET_STUDENT] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch student" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log("🚀 PUT /api/students/[id] - Request received");
  
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      console.log("❌ Unauthorized: Not an admin");
      return NextResponse.json(
        { error: "Unauthorized: Only admins can update students" },
        { status: 401 }
      );
    }

    const { id } = await params;
    console.log("📌 Student ID:", id);
    
    const data = await request.json();
    console.log("📦 Request body:", JSON.stringify(data, null, 2));

    // Basic validation
    if (!data.name || !data.admissionNumber) {
      console.log("❌ Missing required fields");
      return NextResponse.json(
        { error: "Missing required fields: name, admissionNumber" },
        { status: 400 }
      );
    }

    // Check if student exists
    const existingStudent = await prisma.student.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });

    if (!existingStudent) {
      console.log("❌ Student not found:", id);
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    console.log("✅ Existing student found:", existingStudent.id);

    // Check admission number uniqueness (if changed)
    if (data.admissionNumber !== existingStudent.admissionNumber) {
      const duplicate = await prisma.student.findUnique({
        where: { admissionNumber: data.admissionNumber },
      });

      if (duplicate) {
        console.log("❌ Duplicate admission number:", data.admissionNumber);
        return NextResponse.json(
          { error: "Admission number already exists" },
          { status: 409 }
        );
      }
    }

    // Check email uniqueness (if changed and provided)
    if (data.email && data.email !== existingStudent.email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email: data.email.toLowerCase().trim(),
          id: { not: existingStudent.userId || undefined },
        },
      });

      if (existingUser) {
        console.log("❌ Email already in use:", data.email);
        return NextResponse.json(
          { error: "Email already in use by another user" },
          { status: 409 }
        );
      }
    }

    // Update both Student and User in a transaction
    const updatedStudent = await prisma.$transaction(async (tx) => {
      // Update User if linked
      if (existingStudent.userId) {
        await tx.user.update({
          where: { id: existingStudent.userId },
          data: {
            name: data.name.trim(),
            email: data.email?.trim().toLowerCase() || null,
            phone: data.phone?.trim() || null,
          },
        });
        console.log("✅ User updated:", existingStudent.userId);
      }

      // Build the update data
      const updateData: any = {
        name: data.name.trim(),
        admissionNumber: data.admissionNumber.trim(),
        email: data.email?.trim() || null,
        phone: data.phone?.trim() || null,
      };

      // Only include optional fields if they exist
      if (data.dateOfBirth) {
        updateData.dateOfBirth = new Date(data.dateOfBirth);
      }
      if (data.gender) {
        updateData.gender = data.gender;
      }
      if (data.address) {
        updateData.address = data.address.trim();
      }

      // Handle class relation
      if (data.classId !== undefined) {
        if (data.classId && data.classId !== "unassigned") {
          updateData.class = { connect: { id: data.classId } };
          console.log("📚 Class connected:", data.classId);
        } else {
          updateData.class = { disconnect: true };
          console.log("📚 Class disconnected");
        }
      }

      // Handle parent relation
      if (data.parentId !== undefined) {
        if (data.parentId && data.parentId !== "no-parent") {
          updateData.parent = { connect: { id: data.parentId } };
          console.log("👨‍👩‍👦 Parent connected:", data.parentId);
        } else {
          updateData.parent = { disconnect: true };
          console.log("👨‍👩‍👦 Parent disconnected");
        }
      }

      console.log("📝 Final update data:", JSON.stringify(updateData, null, 2));

      // Update Student
      const student = await tx.student.update({
        where: { id },
        data: updateData,
        include: {
          class: { select: { id: true, name: true, level: true } },
          parent: { select: { id: true, name: true, phone: true, email: true } },
          user: { select: { id: true, email: true, name: true, phone: true } },
        },
      });

      return student;
    });

    console.log("✅ Student updated successfully:", updatedStudent.id);

    // Audit log
    try {
      await prisma.auditLog.create({
        data: {
          userId: session.user.id,
          action: "UPDATE_STUDENT",
          entity: "Student",
          entityId: id,
          metadata: {
            admissionNumber: updatedStudent.admissionNumber,
            classId: updatedStudent.class?.id || null,
            updatedFields: Object.keys(data),
          },
        },
      });
      console.log("📝 Audit log created");
    } catch (auditError) {
      console.error("⚠️ Audit log error:", auditError);
      // Don't fail the request if audit log fails
    }

    return NextResponse.json({
      success: true,
      message: "Student updated successfully",
      data: updatedStudent,
    });
  } catch (error: any) {
    console.error("❌ [UPDATE_STUDENT] Error:", error);

    // Handle specific Prisma errors
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Admission number or email already in use" },
        { status: 409 }
      );
    }

    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { 
        error: "Internal server error",
        details: process.env.NODE_ENV === "development" ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log("🚀 DELETE /api/students/[id] - Request received");
  
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      console.log("❌ Unauthorized: Not an admin");
      return NextResponse.json(
        { error: "Unauthorized: Only admins can delete students" },
        { status: 401 }
      );
    }

    const { id } = await params;
    console.log("📌 Student ID:", id);
    
    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        parent: { select: { userId: true } },
        user: { select: { id: true } },
      },
    });

    if (!student) {
      console.log("❌ Student not found:", id);
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    console.log("✅ Existing student found:", student.id);

    // Safety checks - count related records
    const [hasGrades, hasAttendance, hasInvoices] = await Promise.all([
      prisma.grade.count({ where: { studentId: id } }),
      prisma.attendance.count({ where: { studentId: id } }),
      prisma.invoice.count({ where: { studentId: id } }),
    ]);

    console.log("📊 Related records - Grades:", hasGrades, "Attendance:", hasAttendance, "Invoices:", hasInvoices);

    if (hasGrades > 0) {
      console.log("❌ Cannot delete: Has grades");
      return NextResponse.json(
        { 
          error: `Cannot delete student with ${hasGrades} existing grade(s). Please delete grades first.`,
          hasGrades,
          hasAttendance,
          hasInvoices,
        },
        { status: 403 }
      );
    }

    if (hasAttendance > 0) {
      console.log("❌ Cannot delete: Has attendance records");
      return NextResponse.json(
        { 
          error: `Cannot delete student with ${hasAttendance} attendance record(s). Please delete attendance records first.`,
          hasGrades,
          hasAttendance,
          hasInvoices,
        },
        { status: 403 }
      );
    }

    if (hasInvoices > 0) {
      console.log("❌ Cannot delete: Has invoices");
      return NextResponse.json(
        { 
          error: `Cannot delete student with ${hasInvoices} invoice(s). Please delete invoices first.`,
          hasGrades,
          hasAttendance,
          hasInvoices,
        },
        { status: 403 }
      );
    }

    // Delete student and related data in transaction
    await prisma.$transaction(async (tx) => {
      // Delete student
      await tx.student.delete({
        where: { id },
      });
      console.log("✅ Student deleted");

      // If student has a linked user account, delete it too
      if (student.user?.id) {
        await tx.user.delete({
          where: { id: student.user.id },
        });
        console.log("✅ User deleted:", student.user.id);
      }
    });

    // Audit log
    try {
      await prisma.auditLog.create({
        data: {
          userId: session.user.id,
          action: "DELETE_STUDENT",
          entity: "Student",
          entityId: id,
          metadata: {
            admissionNumber: student.admissionNumber,
            name: student.name,
            deletedAt: new Date().toISOString(),
          },
        },
      });
      console.log("📝 Audit log created");
    } catch (auditError) {
      console.error("⚠️ Audit log error:", auditError);
      // Don't fail the request if audit log fails
    }

    return NextResponse.json({
      success: true,
      message: `Student ${student.admissionNumber} deleted successfully`,
    });
  } catch (error: any) {
    console.error("❌ [DELETE_STUDENT] Error:", error);
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: process.env.NODE_ENV === "development" ? error.message : undefined
      },
      { status: 500 }
    );
  }
}