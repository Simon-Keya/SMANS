"use server";

import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

export async function createStudent(data: {
  admissionNo: string;
  firstName: string;
  lastName: string;
  gender: "male" | "female";
  dateOfBirth: Date;
}) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  return prisma.student.create({ data });
}
