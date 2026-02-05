// actions/teacherActions.ts
"use server";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import * as z from "zod";

// ─────────────────────────────────────────
// ────────────────────────────────────────────────

const createTeacherSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").trim(),
  email: z.string().email("Invalid email address").trim().toLowerCase(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const updateTeacherSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").trim().optional(),
  email: z.string().email("Invalid email address").trim().toLowerCase().optional(),
  // password not allowed to be updated here
});

export type CreateTeacherInput = z.infer<typeof createTeacherSchema>;
export type UpdateTeacherInput = z.infer<typeof updateTeacherSchema>;

// ────────────────────────────────────────────────
// Authorization Helper
// ────────────────────────────────────────────────

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    throw new Error("Unauthorized: Admin access required");
  }
  return session;
}

// ────────────────────────────────────────────────
// CREATE - Add new teacher
// ────────────────────────────────────────────────

export async function createTeacher(data: unknown) {
  await requireAdmin();

  const parsed = createTeacherSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.errors[0].message);
  }

  const { name, email, password } = parsed.data;

  // Check for duplicate email
  const existing = await prisma.user.findUnique({
    where: { email },
  });

  if (existing) {
    throw new Error("This email is already registered.");
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const newTeacher = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: "teacher",
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  revalidatePath("/dashboard/teachers");

  return {
    success: true,
    message: "Teacher created successfully",
    teacher: newTeacher,
  };
}

// ────────────────────────────────────────────────
// READ - Get all teachers (used in page.tsx)
// ────────────────────────────────────────────────

export async function getTeachers() {
  await requireAdmin();

  return prisma.user.findMany({
    where: { role: "teacher" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
    orderBy: { name: "asc" },
  });
}

// ────────────────────────────────────────────────
// READ - Get single teacher by ID
// ────────────────────────────────────────────────

export async function getTeacherById(id: string) {
  await requireAdmin();

  const teacher = await prisma.user.findUnique({
    where: { id, role: "teacher" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  if (!teacher) {
    throw new Error("Teacher not found");
  }

  return teacher;
}

// ────────────────────────────────────────────────
// UPDATE - Edit teacher
// ────────────────────────────────────────────────

export async function updateTeacher(id: string, data: unknown) {
  await requireAdmin();

  const parsed = updateTeacherSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.errors[0].message);
  }

  const { name, email } = parsed.data;

  // Check for email conflict
  if (email) {
    const existing = await prisma.user.findUnique({
      where: { email },
    });
    if (existing && existing.id !== id) {
      throw new Error("Email already in use by another user");
    }
  }

  const updated = await prisma.user.update({
    where: { id, role: "teacher" },
    data: {
      ...(name && { name }),
      ...(email && { email: email.toLowerCase() }),
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  revalidatePath("/dashboard/teachers");
  revalidatePath(`/dashboard/teachers/${id}`);

  return {
    success: true,
    message: "Teacher updated successfully",
    teacher: updated,
  };
}

// ────────────────────────────────────────────────
// DELETE - Remove teacher
// ────────────────────────────────────────────────

export async function deleteTeacher(id: string) {
  await requireAdmin();

  const teacher = await prisma.user.findUnique({
    where: { id, role: "teacher" },
  });

  if (!teacher) {
    throw new Error("Teacher not found");
  }

  await prisma.user.delete({
    where: { id },
  });

  revalidatePath("/dashboard/teachers");

  return {
    success: true,
    message: "Teacher deleted successfully",
  };
}