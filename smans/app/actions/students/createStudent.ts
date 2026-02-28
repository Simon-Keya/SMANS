"use server";

import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { getServerSession } from "next-auth";

export async function createStudent(
  data: Prisma.StudentCreateInput
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized - admin only");
  }

  return prisma.student.create({ data });
}