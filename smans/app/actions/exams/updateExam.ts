// app/actions/exams/updateExam.ts
"use server";

import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateExamSchema = z.object({
  examId: z.string().min(1),
  name: z.string().min(1, "Name is required").trim().optional(),
  term: z.string().optional().nullable(),
  date: z.coerce.date().optional(),
});

export async function updateExam(input: unknown) {
  const user = await getCurrentUser();

  if (!user || !["ADMIN", "ACCOUNTANT"].includes(user.role)) {
    throw new Error("Unauthorized: Only admins and accountants can update exams");
  }

  const validated = updateExamSchema.safeParse(input);
  if (!validated.success) {
    throw new Error(validated.error.issues[0]?.message || "Invalid input");
  }

  const { examId, name, term, date } = validated.data;

  // Check if exam exists
  const existing = await prisma.exam.findUnique({
    where: { id: examId },
    select: { id: true, name: true },
  });

  if (!existing) {
    throw new Error("Exam not found");
  }

  try {
    const updated = await prisma.exam.update({
      where: { id: examId },
      data: {
        name: name ? name.trim() : undefined,
        term: term ?? undefined,
        date: date ?? undefined,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "UPDATE_EXAM",
        entity: "Exam",
        entityId: examId,
        metadata: { oldName: existing.name, newName: name, term, date },
      },
    });

    return { success: true, exam: updated };
  } catch (error) {
    console.error("Update exam error:", error);
    throw new Error("Failed to update exam. Please try again.");
  }
}