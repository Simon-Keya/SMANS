// app/actions/settings/role.actions.ts
"use server";

import { requireRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const roleSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").trim(),
  description: z.string().trim().optional(),
  permissions: z.array(z.string()).min(1, "At least one permission is required"),
});

export async function getAllRoles() {
  await requireRole(["ADMIN"]);

  return prisma.role.findMany({
    include: { _count: { select: { users: true } } },
    orderBy: { name: "asc" },
  });
}

export async function createRole(data: unknown) {
  await requireRole(["ADMIN"]);

  const validated = roleSchema.parse(data);

  const existing = await prisma.role.findUnique({
    where: { name: validated.name },
  });

  if (existing) {
    throw new Error("A role with this name already exists");
  }

  const role = await prisma.role.create({ data: validated });

  revalidatePath("/dashboard/settings/roles");
  return role;
}

export async function updateRole(id: string, data: unknown) {
  await requireRole(["ADMIN"]);

  if (!id) throw new Error("Role ID is required");

  const validated = roleSchema.parse(data);

  const role = await prisma.role.update({
    where: { id },
    data: validated,
  });

  revalidatePath("/dashboard/settings/roles");
  return role;
}

export async function deleteRole(id: string) {
  await requireRole(["ADMIN"]);

  if (!id) throw new Error("Role ID is required");

  const role = await prisma.role.findUnique({
    where: { id },
    include: { _count: { select: { users: true } } },
  });

  if (!role) {
    throw new Error("Role not found");
  }

  if (role._count.users > 0) {
    throw new Error("Cannot delete a role that has assigned users");
  }

  await prisma.role.delete({ where: { id } });

  revalidatePath("/dashboard/settings/roles");
  return { success: true };
}