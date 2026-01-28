"use server";

import { prisma } from "@/lib/prisma";

export async function createSubject(data: {
  name: string;
  code: string;
}) {
  return prisma.subject.create({ data });
}
