"use server";

import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { z } from "zod";

// Allowed roles – must match your Prisma enum exactly
const allowedRoles = ["ADMIN", "TEACHER", "STUDENT", "PARENT", "ACCOUNTANT"] as const;

// Main creation schema
const createUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  email: z.string().email("Invalid email").toLowerCase().trim(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: z.string().min(9, "Phone number too short").optional(),
  role: z.enum(allowedRoles, {
    message: `Invalid role. Must be one of: ${allowedRoles.join(", ")}`,
  }),
  // Role-specific required fields
  staffNo: z.string().min(3, "Staff number is required").optional(),
  rollNumber: z.string().min(3, "Roll number is required").optional(),
  classId: z.string().optional(), // for students
  parentId: z.string().optional(), // for students
  occupation: z.string().optional(), // for parents
  relationship: z.string().optional(), // for parents
});

export async function createUser(rawData: unknown) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized: Only administrators can create users");
  }

  // 1. Validate base input
  const data = createUserSchema.safeParse(rawData);
  if (!data.success) {
    throw new Error(data.error.issues[0]?.message || "Invalid input");
  }

  const {
    name,
    email,
    password,
    phone,
    role,
    staffNo,
    rollNumber,
    classId,
    parentId,
    occupation,
    relationship,
  } = data.data;

  // 2. Role-specific required fields
  if (role === "TEACHER" && !staffNo) {
    throw new Error("Staff number is required for teachers");
  }

  if (role === "STUDENT") {
    if (!rollNumber) throw new Error("Roll number is required for students");
    if (!classId) throw new Error("Class is required for students");
    // parentId can be optional
  }

  if (role === "PARENT") {
    if (!occupation) throw new Error("Occupation is recommended for parents");
    if (!relationship) throw new Error("Relationship is required for parents");
  }

  // 3. Check email uniqueness
  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existing) {
    throw new Error("Email is already in use");
  }

  // 4. Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  try {
    const newUser = await prisma.user.create({
      data: {
        name: name?.trim(),
        email,
        password: hashedPassword,
        phone: phone?.trim(),
        role,
        staffNo: role === "TEACHER" ? staffNo?.trim() : null,
        rollNumber: role === "STUDENT" ? rollNumber?.trim() : null,
        classId: role === "STUDENT" ? classId : null,
        parentId: role === "STUDENT" ? parentId : null,
        occupation: role === "PARENT" ? occupation?.trim() : null,
        relationship: role === "PARENT" ? relationship?.trim() : null,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        staffNo: true,
        rollNumber: true,
        classId: true,
        parentId: true,
        occupation: true,
        relationship: true,
        createdAt: true,
      },
    });

    // 5. Audit log
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
          createdBy: session.user.role,
        },
      },
    });

    return {
      success: true,
      user: newUser,
      message: `User "${name || email}" created successfully as ${role}`,
    };
  } catch (error: any) {
    if (error.code === "P2002") {
      throw new Error("Duplicate email or unique field violation");
    }
    console.error("Create user error:", error);
    throw new Error("Failed to create user. Please try again.");
  }
}