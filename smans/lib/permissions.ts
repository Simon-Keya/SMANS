/**
 * Compatibility re-export.
 * Canonical implementation lives in lib/auth/permissions.ts.
 * Prefer importing from "@/lib/auth/permissions" in new code.
 */
export {
  type Role,
  type Permission,
  type AppRole,
  type AppPermission,
  permissions,
  hasPermission,
  hasAllPermissions,
  hasResourcePermission,
  requireRole,
  requirePermission,
  can,
  requirePageAccess,
} from "@/lib/auth/permissions";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import type { Role } from "@/lib/auth/permissions";

/** @deprecated Use getServerSession + role check, or requireRole from auth/permissions */
export async function getCurrentRole(): Promise<Role | null> {
  const session = await getServerSession(authOptions);
  return (session?.user?.role as Role | undefined) ?? null;
}

/** @deprecated Prefer requireRole(["ADMIN"]) */
export async function isAdmin(): Promise<boolean> {
  const role = await getCurrentRole();
  return role === "ADMIN";
}

/** @deprecated Prefer requireRole(...) */
export async function hasRole(required: (Role | null)[]): Promise<boolean> {
  const role = await getCurrentRole();
  return role ? required.includes(role) : false;
}
