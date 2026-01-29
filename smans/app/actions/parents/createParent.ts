"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function createParent(data: {
  email: string;
  password: string;
  name: string;
  phone?: string;
}) {
  // First create the User
  const hashedPassword = await bcrypt.hash(data.password, 10);

  const user = await prisma.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      name: data.name,
      role: "PARENT",
    },
  });

  // Then create Parent and connect to the new User
  const parent = await prisma.parent.create({
    data: {
      name: data.name,
      phone: data.phone ?? null,
      email: data.email,
      user: {
        connect: { id: user.id },  // ← Connect to existing user
      },
    },
  });

  return parent;
}