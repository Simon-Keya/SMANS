"use server";

import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { z } from "zod";

const allowedRoles = ["ADMIN", "TEACHER", "STUDENT", "PARENT", "ACCOUNTANT"] as const;

const createUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").trim().optional(),
  email: z.string().email("Invalid email").toLowerCase().trim(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: z.string().min(9, "Phone number is too short").optional(),
  role: z.enum(allowedRoles, {
    message: `Invalid role. Must be one of: ${allowedRoles.join(", ")}`,
  }),
  // Role-specific fields
  staffNo: z.string().min(3, "Staff number is required").optional(),
  admissionNumber: z.string().min(3, "Admission number is required").optional(),
  classId: z.string().optional(),
  parentId: z.string().optional(),
  occupation: z.string().optional(),
  relationship: z.string().optional(),
});

export async function createUser(rawData: unknown) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized: Only administrators can create users");
  }

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
    admissionNumber,
    classId,
    parentId,
    occupation,
    relationship,
  } = data.data;

  // Role-specific validation
  if (role === "TEACHER" && !staffNo) {
    throw new Error("Staff number is required for teachers");
  }

  if (role === "STUDENT") {
    if (!admissionNumber) throw new Error("Admission number is required for students");
    if (!classId) throw new Error("Class is required for students");
  }

  if (role === "PARENT") {
    if (!relationship) throw new Error("Relationship is required for parents");
  }

  // Check email uniqueness
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error("Email is already in use");

  const hashedPassword = await bcrypt.hash(password, 12);

  try {
    // Create the user first
    const newUser = await prisma.user.create({
      data: {
        name: name?.trim(),
        email,
        password: hashedPassword,
        phone: phone?.trim() || null,
        role,
        staffNo: role === "TEACHER" ? staffNo?.trim() : null,
        isActive: true,
      },
    });

    // Create role-specific records
    if (role === "STUDENT") {
      // Check if admission number is unique
      const existingStudent = await prisma.student.findUnique({
        where: { admissionNumber: admissionNumber! },
      });
      if (existingStudent) {
        throw new Error("Admission number already exists");
      }

      await prisma.student.create({
        data: {
          userId: newUser.id,
          name: name || "Unknown",
          admissionNumber: admissionNumber!,
          classId: classId!,
          parentId: parentId || null,
          email: email,
          phone: phone?.trim() || null,
        },
      });
    } else if (role === "PARENT") {
      await prisma.parent.create({
        data: {
          userId: newUser.id,
          name: name || "Unknown",
          email: email,
          phone: phone?.trim() || null,
          occupation: occupation?.trim() || null,
          relationship: relationship?.trim() || null,
        },
      });
    }

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
          admissionNumber: role === "STUDENT" ? admissionNumber : null,
        },
      },
    });

    return {
      success: true,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        staffNo: newUser.staffNo,
        createdAt: newUser.createdAt,
      },
      message: `User "${name || email}" created successfully as ${role}`,
    };
  } catch (error: any) {
    if (error.code === "P2002") throw new Error("Duplicate entry (email or admission number)");
    console.error("Create user error:", error);
    throw new Error(error.message || "Failed to create user. Please try again.");
  }
}