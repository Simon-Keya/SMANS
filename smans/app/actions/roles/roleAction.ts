// lib/actions/roleAction.ts
"use server";

import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const roleSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  permissions: z.array(z.string()),
});

export async function createRole(data: unknown) {
  const session = await getServerSession(authOptions);
  if (session?.user.role !== "ADMIN") throw new Error("Unauthorized");

  const parsed = roleSchema.parse(data);

  const role = await prisma.role.create({
    data: parsed,
  });

  revalidatePath("/dashboard/settings/roles");
  return role;
}

export async function updateRole(id: string, data: unknown) {
  const session = await getServerSession(authOptions);
  if (session?.user.role !== "ADMIN") throw new Error("Unauthorized");

  const parsed = roleSchema.parse(data);

  const role = await prisma.role.update({
    where: { id },
    data: parsed,
  });

  revalidatePath("/dashboard/settings/roles");
  return role;
}

export async function deleteRole(id: string) {
  const session = await getServerSession(authOptions);
  if (session?.user.role !== "ADMIN") throw new Error("Unauthorized");

  await prisma.role.delete({
    where: { id },
  });

  revalidatePath("/dashboard/settings/roles");
}

export async function getAllRoles() {
  return prisma.role.findMany({
    include: {
      _count: {
        select: { users: true },
      },
    },
    orderBy: { name: "asc" },
  });
}

export async function getRoleById(id: string) {
  return prisma.role.findUnique({
    where: { id },
  });
}