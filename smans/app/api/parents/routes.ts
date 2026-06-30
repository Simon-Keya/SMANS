// app/api/parents/route.ts
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";

const createParentSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").trim(),
  email: z.string().email("Invalid email").trim().toLowerCase().optional(),
  phone: z.string().min(9, "Phone number is required").trim(),
  password: z.string().min(8, "Password must be at least 8 characters").optional(),
  occupation: z.string().optional(),
  relationship: z.string().optional(),
});

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const parents = await prisma.parent.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        occupation: true,
        relationship: true,
        createdAt: true,
        updatedAt: true,
        userId: true,
        students: {
          select: { 
            id: true, 
            name: true, 
            admissionNumber: true,
            class: { select: { name: true } },
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
          },
        },
        _count: {
          select: { students: true },
        },
      },
      orderBy: { name: "asc" },
    });

    // Transform to include student count and status
    const parentsWithCount = parents.map(parent => ({
      ...parent,
      studentCount: parent._count.students,
      hasAccount: !!parent.userId,
      isActive: parent.user?.isActive || false,
    }));

    return NextResponse.json({ success: true, data: parentsWithCount });
  } catch (error) {
    console.error("[GET_PARENTS]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized: Only admins can create parents" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = createParentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { name, email, phone, password, occupation, relationship } = parsed.data;

    // Check phone uniqueness
    const existingPhone = await prisma.parent.findFirst({
      where: { phone },
    });

    if (existingPhone) {
      return NextResponse.json({ error: "Phone number already in use" }, { status: 409 });
    }

    // Check email uniqueness if provided
    if (email) {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      const existingParent = await prisma.parent.findFirst({ where: { email } });

      if (existingUser || existingParent) {
        return NextResponse.json({ error: "Email already in use" }, { status: 409 });
      }
    }

    // Create User + Parent in a transaction (similar to student creation)
    const newParent = await prisma.$transaction(async (tx) => {
      let userId: string | undefined;

      // Create User account if email and password provided, or use default password
      if (email) {
        const hashedPassword = await bcrypt.hash(password || "password123", 12);
        const newUser = await tx.user.create({
          data: {
            name,
            email,
            password: hashedPassword,
            role: "PARENT",
            phone: phone || null,
            isActive: true,
            emailVerified: new Date(),
          },
        });
        userId = newUser.id;
      }

      // Create Parent record
      const parent = await tx.parent.create({
        data: {
          name,
          email: email || null,
          phone,
          occupation: occupation || null,
          relationship: relationship || null,
          userId,
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
              createdAt: true,
            } 
          },
        },
      });

      return parent;
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "CREATE_PARENT",
        entity: "Parent",
        entityId: newParent.id,
        metadata: {
          email: newParent.email,
          phone: newParent.phone,
          hasUser: !!newParent.userId,
        },
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: "Parent created successfully",
      data: newParent 
    }, { status: 201 });

  } catch (error: any) {
    console.error("[CREATE_PARENT]", error);

    if (error.code === "P2002") {
      return NextResponse.json({ error: "Duplicate phone number or email" }, { status: 409 });
    }

    return NextResponse.json({ error: "Failed to create parent. Please try again." }, { status: 500 });
  }
}