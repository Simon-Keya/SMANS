"use server";

import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";

export async function signUpAction(data: {
  name: string;
  email: string;
  password: string;
  role: "ADMIN" | "TEACHER" | "STUDENT" | "PARENT";
}) {
  const session = await getServerSession(authOptions);

  // Only ADMIN can create accounts
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized - admin access required");
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: data.email.toLowerCase() },
  });

  if (existingUser) {
    throw new Error("Email already in use");
  }

  const hashedPassword = await bcrypt.hash(data.password, 12);

  const newUser = await prisma.user.create({
    data: {
      name: data.name.trim(),
      email: data.email.toLowerCase(),
      password: hashedPassword,
      role: data.role,
    },
  });

  return {
    success: true,
    userId: newUser.id,
  };
}