"use server";

import { prisma } from "@/lib/prisma";

export async function createExam(data: {
  name: string;
  term?: string;
  year?: number;
  date: string | Date;           // required
  classId: string;               // required
}) {
  // Basic validation
  if (!data.name.trim()) {
    throw new Error("Exam name is required");
  }
  if (!data.classId) {
    throw new Error("Class ID is required");
  }

  // Handle date (string → Date)
  const examDate = typeof data.date === "string" ? new Date(data.date) : data.date;
  if (isNaN(examDate.getTime())) {
    throw new Error("Invalid date format");
  }

  return prisma.exam.create({
    data: {
      name: data.name.trim(),
      term: data.term ?? null,
      date: examDate,
      classId: data.classId,
    },
  });
}