"use server";

import { prisma } from "@/lib/prisma";

export async function createExam(data: {
  name: string;
  term: string;
  year: number;
}) {
  return prisma.exam.create({ data });
}
