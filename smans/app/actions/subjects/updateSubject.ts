// app/actions/subjects/updateSubject.ts
"use server";

import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSubjectSchema = z.object({
  subjectId: z.string().min(1),
  name: z.string().min(1, "Name is required").trim().optional(),
  code: z.string().min(1, "Code is required").trim().toUpperCase().optional(),
});

export async function updateSubject(input: unknown) {
  const user = await getCurrentUser();

  if (!user || !["ADMIN", "ACCOUNTANT"].includes(user.role)) {
    throw new Error("Unauthorized: Only admins and accountants can update subjects");
  }

  const validated = updateSubjectSchema.safeParse(input);
  if (!validated.success) {
    throw new Error(validated.error.issues[0]?.message || "Invalid input");
  }

  const { subjectId, name, code } = validated.data;

  // Check if subject exists
  const existing = await prisma.subject.findUnique({
    where: { id: subjectId },
    select: { id: true, name: true, code: true },
  });

  if (!existing) {
    throw new Error("Subject not found");
  }

  // If code is being changed, check for uniqueness
  if (code && code !== existing.code) {
    const duplicate = await prisma.subject.findUnique({
      where: { code },
      select: { id: true },
    });
    if (duplicate) {
      throw new Error(`Subject code "${code}" is already in use`);
    }
  }

  try {
    const updated = await prisma.subject.update({
      where: { id: subjectId },
      data: {
        name: name ? name.trim() : undefined,
        code: code ? code.trim().toUpperCase() : undefined,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "UPDATE_SUBJECT",
        entity: "Subject",
        entityId: subjectId,
        metadata: { oldName: existing.name, newName: name, oldCode: existing.code, newCode: code },
      },
    });

    return { success: true, subject: updated };
  } catch (error) {
    console.error("Update subject error:", error);
    throw new Error("Failed to update subject. Please try again.");
  }
}