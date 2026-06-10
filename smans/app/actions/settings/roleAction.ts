// app/actions/settings/role.actions.ts
"use server";

import { requireRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Since Role is an enum, just return the enum values as strings
export async function getAllRoles() {
  await requireRole(["ADMIN"]);

  // Return the enum values
  const roles = ["ADMIN", "TEACHER", "STUDENT", "PARENT", "ACCOUNTANT"];
  
  return roles.map(role => ({
    name: role,
    description: getRoleDescription(role),
    _count: { users: 0 }, // You can implement user count query if needed
  }));
}

function getRoleDescription(role: string): string {
  const descriptions: Record<string, string> = {
    ADMIN: "Full system access",
    TEACHER: "Manage classes, assignments, and grades",
    STUDENT: "View grades and assignments",
    PARENT: "Monitor child's progress",
    ACCOUNTANT: "Manage fees and invoices",
  };
  return descriptions[role] || "Custom role";
}

export async function createRole(data: unknown) {
  throw new Error("Cannot create custom roles. Role is defined as enum in schema.");
}

export async function updateRole(id: string, data: unknown) {
  throw new Error("Cannot update roles. Role is defined as enum in schema.");
}

export async function deleteRole(id: string) {
  throw new Error("Cannot delete roles. Role is defined as enum in schema.");
}