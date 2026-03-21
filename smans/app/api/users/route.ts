import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import * as z from "zod";

// Allowed roles
const allowedRoles = ["ADMIN", "TEACHER", "STUDENT", "PARENT", "ACCOUNTANT"] as const;

// Create schema
const createUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").trim(),
  email: z.string().email("Invalid email").trim().toLowerCase(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: z.string().min(9, "Phone too short").optional(),
  role: z.enum(allowedRoles, {
    message: `Invalid role. Must be one of: ${allowedRoles.join(", ")}`,
  }),
});

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const users = await prisma.user.findMany({
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
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    console.error("[GET_USERS]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = createUserSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { name, email, password, phone, role } = parsed.data;

    // Check email uniqueness
    const existing = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json({ error: "Email already exists" }, { status: 409 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone: phone?.trim(),
        role,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "CREATE_USER",
        entity: "User",
        entityId: newUser.id,
        metadata: {
          email: newUser.email,
          role: newUser.role,
          phone: newUser.phone || null,
        },
      },
    });

    return NextResponse.json({ success: true, data: newUser }, { status: 201 });
  } catch (error: any) {
    console.error("[CREATE_USER]", error);

    if (error.code === "P2002") {
      return NextResponse.json({ error: "Email already exists" }, { status: 409 });
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}