"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function createTeacher(data: {
  email: string;
  password: string;
  name: string;
  staffNo: string;
}) {
  const hashedPassword = await bcrypt.hash(data.password, 10);

  return prisma.teacher.create({
    data: {
      staffNo: data.staffNo,
      user: {
        create: {
          email: data.email,
          password: hashedPassword,
          name: data.name,
          role: "teacher",
        },
      },
    },
  });
}
