// app/actions/settings/roleAction.ts
"use server";

import { requireRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const roleSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  permissions: z.array(z.string()).min(1),
});

export async function getAllRoles() {
  await requireRole(["ADMIN"]);  // ← FIXED: array

  return prisma.role.findMany({
    include: {
      _count: { select: { users: true } },
    },
    orderBy: { name: "asc" },
  });
}

export async function createRole(data: unknown) {
  await requireRole(["ADMIN"]);  // ← FIXED

  const validated = roleSchema.parse(data);

  const existing = await prisma.role.findUnique({
    where: { name: validated.name },
  });

  if (existing) {
    throw new Error("Role name already exists");
  }

  const role = await prisma.role.create({
    data: validated,
  });

  revalidatePath("/dashboard/settings/roles");
  return role;
}

export async function updateRole(id: string, data: unknown) {
  await requireRole(["ADMIN"]);  // ← FIXED

  const validated = roleSchema.parse(data);

  const role = await prisma.role.update({
    where: { id },
    data: validated,
  });

  revalidatePath("/dashboard/settings/roles");
  return role;
}

export async function deleteRole(id: string) {
  await requireRole(["ADMIN"]);  // ← FIXED

  const role = await prisma.role.findUnique({
    where: { id },
    include: { _count: { select: { users: true } } },
  });

  if (!role) {
    throw new Error("Role not found");
  }

  if (role._count.users > 0) {
    throw new Error("Cannot delete role with assigned users");
  }

  await prisma.role.delete({ where: { id } });

  revalidatePath("/dashboard/settings/roles");
}