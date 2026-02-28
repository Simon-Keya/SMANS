"use server";

import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";

export async function createUser(data: {
  name?: string;
  email: string;
  password: string;
  role: "ADMIN" | "TEACHER" | "STUDENT" | "PARENT";  // ← FIXED: uppercase to match enum
}) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {  // ← FIXED: uppercase
    throw new Error("Unauthorized");
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: data.role,
    },
  });

  return { success: true };
}