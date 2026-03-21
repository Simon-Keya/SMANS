import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import * as z from "zod";

// Allowed roles – must match Prisma enum
const allowedRoles = ["ADMIN", "TEACHER", "STUDENT", "PARENT", "ACCOUNTANT"] as const;

// Update schema
const updateUserSchema = z.object({
  name: z.string().min(2, "Name too short").trim().optional(),
  email: z.string().email("Invalid email").trim().toLowerCase().optional(),
  password: z.string().min(8, "Password too short").optional(),
  phone: z.string().min(9, "Phone too short").optional(),
  role: z.enum(allowedRoles).optional(),
  isActive: z.boolean().optional(),
});

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        staffNo: true,
        rollNumber: true,
        classId: true,
        parentId: true,
        occupation: true,
        relationship: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error("[GET_USER]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = updateUserSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { name, email, password, phone, role, isActive } = parsed.data;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: params.id },
      select: { id: true, email: true },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // If changing email, check uniqueness
    if (email && email !== existingUser.email) {
      const emailTaken = await prisma.user.findUnique({
        where: { email },
        select: { id: true },
      });

      if (emailTaken) {
        return NextResponse.json({ error: "Email already in use" }, { status: 409 });
      }
    }

    // Build update object
    const updateData: any = {};

    if (name) updateData.name = name.trim();
    if (email) updateData.email = email;
    if (password) updateData.password = await bcrypt.hash(password, 12);
    if (phone !== undefined) updateData.phone = phone?.trim() || null;
    if (role !== undefined) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;

    // Perform update
    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        updatedAt: true,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "UPDATE_USER",
        entity: "User",
        entityId: params.id,
        metadata: {
          updatedFields: Object.keys(updateData),
          targetEmail: existingUser.email,
        },
      },
    });

    return NextResponse.json({ success: true, data: updatedUser });
  } catch (error) {
    console.error("[UPDATE_USER]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: { id: true, email: true, name: true, role: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prevent self-deletion
    if (session.user.id === params.id) {
      return NextResponse.json({ error: "Cannot delete your own account" }, { status: 403 });
    }

    // Optional: role-specific safety (example: don't delete teachers with classes)
    if (user.role === "TEACHER") {
      const classCount = await prisma.class.count({ where: { teacherId: params.id } });
      if (classCount > 0) {
        return NextResponse.json(
          { error: `Cannot delete teacher assigned to ${classCount} class(es)` },
          { status: 403 }
        );
      }
    }

    // Soft delete (recommended) – comment out hard delete if using this
    // await prisma.user.update({
    //   where: { id: params.id },
    //   data: { deletedAt: new Date(), isActive: false },
    // });

    // Hard delete (your original)
    await prisma.user.delete({ where: { id: params.id } });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "DELETE_USER",
        entity: "User",
        entityId: params.id,
        metadata: {
          email: user.email,
          name: user.name || null,
          role: user.role,
        },
      },
    });

    return NextResponse.json({ success: true, message: "User deleted" });
  } catch (error) {
    console.error("[DELETE_USER]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}