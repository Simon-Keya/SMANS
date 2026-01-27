"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function createParent(data: {
  email: string;
  password: string;
  name: string;
}) {
  const hashedPassword = await bcrypt.hash(data.password, 10);

  return prisma.parent.create({
    data: {
      user: {
        create: {
          email: data.email,
          password: hashedPassword,
          name: data.name,
          role: "parent",
        },
      },
    },
  });
}
