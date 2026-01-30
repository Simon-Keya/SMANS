"use server";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";

export async function signUpAction(data: {
  name?: string;
  email: string;
  password: string;
  role: "ADMIN" | "TEACHER" | "STUDENT" | "PARENT";  // ← FIXED: uppercase literals
}) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {  // ← FIXED: uppercase comparison
    throw new Error("Unauthorized - admin access required");
  }

  // Optional: prevent duplicate email
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new Error("Email already in use");
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const newUser = await prisma.user.create({
    data: {
      name: data.name?.trim() || null,
      email: data.email.trim(),
      password: hashedPassword,
      role: data.role,  // now safe
    },
  });

  return { success: true, userId: newUser.id };
}