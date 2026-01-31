"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function createParent(data: {
  email: string;
  password: string;
  name: string;
  phone?: string;
}) {
  try {
    // Optional: check if email already exists
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existing) {
      throw new Error("Email already in use");
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        email: data.email.trim(),
        password: hashedPassword,
        name: data.name.trim(),
        role: "PARENT",
      },
    });

    const parent = await prisma.parent.create({
      data: {
        name: data.name.trim(),
        phone: data.phone?.trim() ?? null,
        email: data.email.trim(),
        user: {
          connect: { id: user.id },
        },
      },
    });

    return { success: true, parent };
  } catch (error) {
    console.error("[CREATE_PARENT_ERROR]", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create parent",
    };
  }
}