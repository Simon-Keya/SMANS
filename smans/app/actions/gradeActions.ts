"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function enterGrades(data: {
  studentId: string;
  examName: string;
  grades: {
    subject: string;
    marks: number;
    maxMarks: number;
  }[];
}) {
  const { studentId, examName, grades } = data;

  await prisma.$transaction(
    grades.map((grade) =>
      prisma.grade.upsert({
        where: {
          studentId_subject_examName: {
            studentId,
            subject: grade.subject,
            examName,
          },
        },
        update: {
          marks: grade.marks,
        },
        create: {
          studentId,
          examName,
          subject: grade.subject,
          marks: grade.marks,
          maxMarks: grade.maxMarks,
        },
      })
    )
  );

  revalidatePath("/dashboard/grades");
  revalidatePath(`/dashboard/grades/${studentId}`);
}