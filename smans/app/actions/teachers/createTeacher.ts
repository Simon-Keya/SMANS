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

  // Create a User with role TEACHER
  const teacherUser = await prisma.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      name: data.name,
      role: "TEACHER",
      staffNo: data.staffNo,  // If you add this field to User model (see below)
    },
  });

  return teacherUser;
}