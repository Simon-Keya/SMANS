// lib/permissions.ts

import { authOptions } from "@/lib/auth/auth";
import { getServerSession } from "next-auth";

/* =========================
   ROLE TYPES (UNIFIED)
========================= */

export type Role = "ADMIN" | "TEACHER" | "STUDENT" | "PARENT";

/* =========================
   PERMISSION MAP
========================= */

export const permissions: Record<Role, string[]> = {
  ADMIN: ["*"],

  TEACHER: [
    "students.read",
    "students.write",
    "attendance.read",
    "attendance.write",
    "grades.read",
    "grades.write",
    "reports.read",
  ],

  STUDENT: [
    "grades.read",
    "attendance.read",
  ],

  PARENT: [
    "grades.read",
    "attendance.read",
    "fees.read",
  ],
};

/* =========================
   BASIC PERMISSION CHECK
========================= */

export function hasPermission(
  role: Role,
  permission: string
): boolean {
  if (permissions[role]?.includes("*")) return true;
  return permissions[role]?.includes(permission) ?? false;
}

/* =========================
   SERVER: REQUIRE ROLE
========================= */

export async function requireRole(
  ...allowedRoles: Role[]
) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const userRole = session.user.role as Role | undefined;

  if (!userRole || !allowedRoles.includes(userRole)) {
    throw new Error("Forbidden");
  }

  return session;
}

/* =========================
   SERVER: REQUIRE PERMISSION
========================= */

export async function requirePermission(
  permission: string
) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const role = session.user.role as Role | undefined;

  if (!role || !hasPermission(role, permission)) {
    throw new Error("Forbidden");
  }

  return session;
}

/* =========================
   OPTIONAL: SAFE CHECK
========================= */

export async function checkPermission(
  permission: string
): Promise<boolean> {
  const session = await getServerSession(authOptions);

  if (!session?.user) return false;

  const role = session.user.role as Role | undefined;
  if (!role) return false;

  return hasPermission(role, permission);
}