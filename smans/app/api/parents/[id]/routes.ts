// app/api/parents/[id]/route.ts
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";

const updateParentSchema = z.object({
  name: z.string().min(2).trim().optional(),
  email: z.string().email().trim().toLowerCase().optional(),
  phone: z.string().min(9).trim().optional(),
  occupation: z.string().optional().nullable(),
  relationship: z.string().optional().nullable(),
  password: z.string().min(8).optional(),
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
    
    const parent = await prisma.parent.findUnique({
      where: { id },
      include: {
        students: {
          select: { 
            id: true, 
            name: true, 
            admissionNumber: true,
            class: { select: { id: true, name: true, level: true } },
            email: true,
            phone: true,
          },
        },
        user: { 
          select: { 
            id: true,
            email: true, 
            phone: true, 
            name: true, 
            isActive: true,
            createdAt: true,
            updatedAt: true,
          } 
        },
        _count: {
          select: { students: true },
        },
      },
    });

    if (!parent) {
      return NextResponse.json({ error: "Parent not found" }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      data: {
        ...parent,
        studentCount: parent._count.students,
      }
    });
  } catch (error) {
    console.error("[GET_PARENT]", error);
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
    const parsed = updateParentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const { email, phone, password, ...rest } = parsed.data;

    // Check if parent exists
    const existingParent = await prisma.parent.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!existingParent) {
      return NextResponse.json({ error: "Parent not found" }, { status: 404 });
    }

    // Prevent email conflict
    if (email && email !== existingParent.email) {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      const existingParentEmail = await prisma.parent.findFirst({
        where: { 
          email, 
          id: { not: id } 
        },
      });

      if (existingUser || existingParentEmail) {
        return NextResponse.json({ error: "Email already in use" }, { status: 409 });
      }
    }

    // Prevent phone conflict
    if (phone && phone !== existingParent.phone) {
      const existingPhone = await prisma.parent.findFirst({
        where: { 
          phone, 
          id: { not: id } 
        },
      });

      if (existingPhone) {
        return NextResponse.json({ error: "Phone number already in use" }, { status: 409 });
      }
    }

    // Update in transaction
    const updated = await prisma.$transaction(async (tx) => {
      // Update User if exists
      if (existingParent.userId && (email || phone || password)) {
        const userUpdateData: any = {};
        if (email) userUpdateData.email = email;
        if (phone) userUpdateData.phone = phone;
        if (rest.name) userUpdateData.name = rest.name;
        if (password) {
          userUpdateData.password = await bcrypt.hash(password, 12);
        }

        await tx.user.update({
          where: { id: existingParent.userId },
          data: userUpdateData,
        });
      }

      // Update Parent
      return tx.parent.update({
        where: { id },
        data: {
          name: rest.name,
          email: email || null,
          phone: phone || null,
          occupation: rest.occupation,
          relationship: rest.relationship,
        },
        include: {
          students: { 
            select: { 
              id: true, 
              name: true, 
              admissionNumber: true,
              class: { select: { name: true } },
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
        },
      });
    });

    // Audit log
    if (prisma.auditLog) {
      await prisma.auditLog.create({
        data: {
          userId: session.user.id,
          action: "UPDATE_PARENT",
          entity: "Parent",
          entityId: id,
          metadata: {
            updatedFields: Object.keys(parsed.data),
          },
        },
      });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("[UPDATE_PARENT]", error);
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
    
    const parent = await prisma.parent.findUnique({
      where: { id },
      include: { 
        students: true,
        user: { select: { id: true } },
        _count: { select: { students: true } },
      },
    });

    if (!parent) {
      return NextResponse.json({ error: "Parent not found" }, { status: 404 });
    }

    // Prevent deletion if parent has linked students
    if (parent.students.length > 0) {
      return NextResponse.json(
        { 
          error: `Cannot delete parent with ${parent.students.length} linked student(s). Please reassign students first.` 
        },
        { status: 409 }
      );
    }

    // Delete in transaction
    await prisma.$transaction(async (tx) => {
      // Delete parent
      await tx.parent.delete({
        where: { id },
      });

      // Delete linked user if exists
      if (parent.userId) {
        await tx.user.delete({
          where: { id: parent.userId },
        });
      }
    });

    // Audit log
    if (prisma.auditLog) {
      await prisma.auditLog.create({
        data: {
          userId: session.user.id,
          action: "DELETE_PARENT",
          entity: "Parent",
          entityId: id,
          metadata: {
            name: parent.name,
            email: parent.email,
            phone: parent.phone,
          },
        },
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Parent ${parent.name} deleted successfully` 
    });
  } catch (error) {
    console.error("[DELETE_PARENT]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}