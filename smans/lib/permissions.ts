// lib/permissions.ts
// Role-based access control helpers

import { authOptions } from "@/lib/auth/auth";
import { getServerSession } from "next-auth";

export type AppRole = "ADMIN" | "TEACHER" | "STUDENT" | "PARENT" | null;

/**
 * Get current user's role from session
 */
export async function getCurrentRole(): Promise<AppRole> {
  const session = await getServerSession(authOptions);
  return (session?.user?.role as AppRole) ?? null;
}

/**
 * Check if current user is admin
 */
export async function isAdmin(): Promise<boolean> {
  const role = await getCurrentRole();
  return role === "ADMIN";
}

/**
 * Check if current user has one of the required roles
 */
export async function hasRole(required: AppRole[]): Promise<boolean> {
  const role = await getCurrentRole();
  return role ? required.includes(role) : false;
}

/**
 * Throw if user is not authenticated or lacks required role
 * Usage in server actions / route handlers
 */
export async function requireRole(required: AppRole[]) {
  const role = await getCurrentRole();

  if (!role) {
    throw new Error("Unauthorized - not authenticated");
  }

  if (!required.includes(role)) {
    throw new Error(`Forbidden - required role: ${required.join(" or ")}`);
  }
}

/**
 * Example usage in action:
 * await requireRole(["ADMIN", "TEACHER"]);
 */