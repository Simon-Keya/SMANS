"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { requirePermission } from "@/lib/auth/permissions";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).max(200),
  phone: z.string().max(30).optional(),
});

export async function createParent(data: {
  email: string;
  password: string;
  name: string;
  phone?: string;
}) {
  await requirePermission("users:write");

  const validated = schema.safeParse(data);
  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues[0]?.message || "Invalid input",
    };
  }

  try {
    const existing = await prisma.user.findUnique({
      where: { email: validated.data.email.toLowerCase().trim() },
    });
    if (existing) {
      return { success: false, error: "Email already in use" };
    }

    const hashedPassword = await bcrypt.hash(validated.data.password, 12);

    const user = await prisma.user.create({
      data: {
        email: validated.data.email.toLowerCase().trim(),
        password: hashedPassword,
        name: validated.data.name.trim(),
        role: "PARENT",
      },
    });

    const parent = await prisma.parent.create({
      data: {
        name: validated.data.name.trim(),
        phone: validated.data.phone?.trim() ?? null,
        email: validated.data.email.toLowerCase().trim(),
        user: { connect: { id: user.id } },
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
