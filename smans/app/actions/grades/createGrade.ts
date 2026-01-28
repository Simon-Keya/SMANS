"use server";

import { prisma } from "@/lib/prisma";

export async function createGrade(data: {
  studentId: string;
  examId: string;
  subjectId: string;
  marks: number;
  maxMarks: number;
}) {
  return prisma.grade.create({ data });
}
