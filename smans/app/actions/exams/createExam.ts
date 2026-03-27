// app/actions/exams/createExam.ts
"use server";

import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createExamSchema = z.object({
  name: z.string().min(1, "Exam name is required").trim(),
  term: z.string().optional(),
  year: z.number().int().min(2000).max(2100).optional(),
  date: z.coerce.date(),
  classId: z.string().min(1, "Class ID is required"),
});

export async function createExam(input: unknown) {
  const user = await getCurrentUser();

  // Only ADMIN and TEACHER can create exams
  if (!user || !["ADMIN", "TEACHER"].includes(user.role)) {
    throw new Error("Unauthorized: Only admins and teachers can create exams");
  }

  const validated = createExamSchema.safeParse(input);
  if (!validated.success) {
    throw new Error(validated.error.issues[0]?.message || "Invalid input");
  }

  const { name, term, year, date, classId } = validated.data;

  // Check if class exists
  const classExists = await prisma.class.findUnique({
    where: { id: classId },
    select: { id: true },
  });

  if (!classExists) {
    throw new Error("Class not found");
  }

  try {
    const exam = await prisma.exam.create({
      data: {
        name: name.trim(),
        term: term?.trim() || null,
        date,
        classId,
      },
      include: {
        class: { select: { name: true } },
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "CREATE_EXAM",
        entity: "Exam",
        entityId: exam.id,
        metadata: { name: exam.name, classId, term, date: date.toISOString() },
      },
    });

    return { success: true, exam };
  } catch (error) {
    console.error("Create exam error:", error);
    throw new Error("Failed to create exam. Please try again.");
  }
}