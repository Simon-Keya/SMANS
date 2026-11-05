"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/permissions";
import { assertCanAccessStudent } from "@/lib/auth/ownership";
import { AuditService } from "@/lib/services/audit.service";
import { getCurrentUser } from "@/lib/auth/session";
import { z } from "zod";

const schema = z.object({
  studentId: z.string().min(1),
  examId: z.string().min(1),
  subjectId: z.string().min(1),
  marks: z.number().min(0),
  maxMarks: z.number().positive(),
});

export async function createGrade(data: {
  studentId: string;
  examId: string;
  subjectId: string;
  marks: number;
  maxMarks: number;
}) {
  await requirePermission("grades:enter");
  await assertCanAccessStudent(data.studentId, { write: true });

  const validated = schema.safeParse(data);
  if (!validated.success) {
    throw new Error(validated.error.issues[0]?.message || "Invalid grade data");
  }

  const { studentId, examId, subjectId, marks, maxMarks } = validated.data;
  if (marks > maxMarks) {
    throw new Error("Marks cannot exceed max marks");
  }

  const grade = await prisma.grade.create({
    data: { studentId, examId, subjectId, marks, maxMarks },
  });

  const user = await getCurrentUser();
  await AuditService.log(user?.id ?? null, "CREATE", "Grade", grade.id, {
    studentId,
    examId,
    marks,
  });

  return grade;
}
