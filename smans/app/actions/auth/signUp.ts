"use server";

import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";

export async function signUpAction(data: {
  name: string;
  email: string;
  password: string;
  role: "TEACHER" | "STUDENT" | "PARENT";
}) {
  const session = await getServerSession(authOptions);

  const userCount = await prisma.user.count();

  // ─────────────────────────────
  // FIRST USER → AUTO ADMIN
  // ─────────────────────────────
  if (userCount === 0) {
    const hashedPassword = await bcrypt.hash(data.password, 12);

    const admin = await prisma.user.create({
      data: {
        name: data.name.trim(),
        email: data.email.toLowerCase(),
        password: hashedPassword,
        role: "ADMIN",
      },
    });

    return {
      success: true,
      message: "First admin account created",
      userId: admin.id,
    };
  }

  // ─────────────────────────────
  // ONLY ADMIN CAN CREATE USERS
  // ─────────────────────────────
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Only administrators can create accounts.");
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