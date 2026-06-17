// app/api/users/[id]/route.ts
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import * as z from "zod";
import bcrypt from "bcryptjs";

const updateUserSchema = z.object({
  name: z.string().min(2).trim().optional(),
  email: z.string().email().trim().toLowerCase().optional(),
  phone: z.string().min(9).optional(),
  role: z.enum(["ADMIN", "TEACHER", "STUDENT", "PARENT", "ACCOUNTANT"]).optional(),
  staffNo: z.string().optional(),
  isActive: z.boolean().optional(),
  password: z.string().min(8).optional(),
  // Role-specific fields
  admissionNumber: z.string().optional(),
  classId: z.string().optional(),
  parentId: z.string().optional(),
  occupation: z.string().optional(),
  relationship: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        staffNo: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch role-specific details
    let roleDetails = null;
    if (user.role === "STUDENT") {
      roleDetails = await prisma.student.findUnique({
        where: { userId: user.id },
        select: {
          admissionNumber: true,
          classId: true,
          parentId: true,
          admissionDate: true,
          dateOfBirth: true,
          gender: true,
          address: true,
        },
      });
    } else if (user.role === "PARENT") {
      roleDetails = await prisma.parent.findUnique({
        where: { userId: user.id },
        select: {
          occupation: true,
          relationship: true,
        },
      });
    } else if (user.role === "TEACHER") {
      // Teacher-specific details (staffNo is already in User)
      roleDetails = { staffNo: user.staffNo };
    }

    return NextResponse.json({
      success: true,
      data: {
        ...user,
        ...roleDetails,
      },
    });
  } catch (error) {
    console.error("[GET_USER]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = updateUserSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const {
      name,
      email,
      phone,
      role,
      staffNo,
      isActive,
      password,
      admissionNumber,
      classId,
      parentId,
      occupation,
      relationship,
    } = parsed.data;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
      include: {
        student: true,
        parent: true,
      },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check email uniqueness if changed
    if (email && email !== existingUser.email) {
      const emailExists = await prisma.user.findFirst({
        where: {
          email,
          id: { not: id },
        },
      });
      if (emailExists) {
        return NextResponse.json({ error: "Email already in use" }, { status: 409 });
      }
    }

    // Update in transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Update User
      const updateData: any = {};
      if (name !== undefined) updateData.name = name.trim();
      if (email !== undefined) updateData.email = email.toLowerCase().trim();
      if (phone !== undefined) updateData.phone = phone.trim() || null;
      if (role !== undefined) updateData.role = role;
      if (staffNo !== undefined) updateData.staffNo = staffNo.trim() || null;
      if (isActive !== undefined) updateData.isActive = isActive;
      if (password !== undefined) {
        updateData.password = await bcrypt.hash(password, 12);
      }

      const updatedUser = await tx.user.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          staffNo: true,
          isActive: true,
          updatedAt: true,
        },
      });

      // 2. Update role-specific record
      if (existingUser.role === "STUDENT" && existingUser.student) {
        const studentData: any = {};
        if (name !== undefined) studentData.name = name.trim();
        if (phone !== undefined) studentData.phone = phone.trim() || null;
        if (email !== undefined) studentData.email = email.toLowerCase().trim();
        if (admissionNumber !== undefined) studentData.admissionNumber = admissionNumber.trim();
        if (classId !== undefined) studentData.classId = classId;
        if (parentId !== undefined) studentData.parentId = parentId || null;

        await tx.student.update({
          where: { id: existingUser.student.id },
          data: studentData,
        });
      } else if (existingUser.role === "PARENT" && existingUser.parent) {
        const parentData: any = {};
        if (name !== undefined) parentData.name = name.trim();
        if (phone !== undefined) parentData.phone = phone.trim() || null;
        if (email !== undefined) parentData.email = email.toLowerCase().trim();
        if (occupation !== undefined) parentData.occupation = occupation?.trim() || null;
        if (relationship !== undefined) parentData.relationship = relationship?.trim() || null;

        await tx.parent.update({
          where: { id: existingUser.parent.id },
          data: parentData,
        });
      }

      // 3. Audit log
      await tx.auditLog.create({
        data: {
          userId: session.user.id,
          action: "UPDATE_USER",
          entity: "User",
          entityId: id,
          metadata: {
            updatedFields: Object.keys(parsed.data),
            role: updatedUser.role,
          },
        },
      });

      return updatedUser;
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error("[UPDATE_USER]", error);
    
    if (error.code === "P2002") {
      return NextResponse.json({ error: "Duplicate entry" }, { status: 409 });
    }
    
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    // Prevent self-deletion
    if (id === session.user.id) {
      return NextResponse.json(
        { error: "You cannot delete your own account" },
        { status: 403 }
      );
    }

    const userToDelete = await prisma.user.findUnique({
      where: { id },
      include: {
        student: { select: { id: true } },
        parent: { select: { id: true } },
        _count: {
          select: {
            teacherClasses: true,
            assignmentsCreated: true,
            createdInvoices: true,
          },
        },
      },
    });

    if (!userToDelete) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Safety checks
    if (userToDelete.role === "TEACHER" && userToDelete._count.teacherClasses > 0) {
      return NextResponse.json(
        { error: `Cannot delete teacher with ${userToDelete._count.teacherClasses} assigned class(es)` },
        { status: 409 }
      );
    }

    if (userToDelete._count.assignmentsCreated > 0) {
      return NextResponse.json(
        { error: `Cannot delete user with ${userToDelete._count.assignmentsCreated} created assignment(s)` },
        { status: 409 }
      );
    }

    if (userToDelete._count.createdInvoices > 0) {
      return NextResponse.json(
        { error: `Cannot delete user with ${userToDelete._count.createdInvoices} created invoice(s)` },
        { status: 409 }
      );
    }

    // Delete in transaction
    await prisma.$transaction(async (tx) => {
      // Delete role-specific records first
      if (userToDelete.student) {
        await tx.student.delete({ where: { id: userToDelete.student.id } });
      }
      if (userToDelete.parent) {
        await tx.parent.delete({ where: { id: userToDelete.parent.id } });
      }

      // Delete the user
      await tx.user.delete({ where: { id } });
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "DELETE_USER",
        entity: "User",
        entityId: id,
        metadata: {
          email: userToDelete.email,
          name: userToDelete.name,
          role: userToDelete.role,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: `User ${userToDelete.email} deleted successfully`,
    });
  } catch (error: any) {
    console.error("[DELETE_USER]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}