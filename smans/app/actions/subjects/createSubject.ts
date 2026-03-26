// app/actions/subjects/createSubject.ts
"use server";

import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createSubjectSchema = z.object({
  name: z.string().min(1, "Subject name is required").trim(),
  code: z.string().min(1, "Subject code is required").trim().toUpperCase(),
});

export async function createSubject(input: unknown) {
  const user = await getCurrentUser();

  if (!user || !["ADMIN", "ACCOUNTANT"].includes(user.role)) {
    throw new Error("Unauthorized: Only admins and accountants can create subjects");
  }

  const validated = createSubjectSchema.safeParse(input);
  if (!validated.success) {
    throw new Error(validated.error.issues[0]?.message || "Invalid input");
  }

  const { name, code } = validated.data;

  // Check for duplicate code
  const existing = await prisma.subject.findUnique({
    where: { code },
    select: { id: true },
  });

  if (existing) {
    throw new Error(`Subject code "${code}" already exists`);
  }

  try {
    const subject = await prisma.subject.create({
      data: {
        name: name.trim(),
        code: code.trim().toUpperCase(),
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "CREATE_SUBJECT",
        entity: "Subject",
        entityId: subject.id,
        metadata: { name, code },
      },
    });

    return { success: true, subject };
  } catch (error) {
    console.error("Create subject error:", error);
    throw new Error("Failed to create subject. Please try again.");
  }
}