// lib/permissions.ts
import { authOptions } from "@/lib/auth/auth";
import { getServerSession } from "next-auth";

/* =========================
   ROLE & PERMISSION TYPES
========================= */

/**
 * All supported roles in the system
 */
export type Role = "ADMIN" | "TEACHER" | "STUDENT" | "PARENT";

/**
 * All possible permissions in the system (central source of truth)
 * Update this union when adding new permissions
 */
export type Permission =
  // Wildcards
  | "*"                       // Full access (admin only)
  | "users:*"
  | "students:*"
  | "teachers:*"
  | "classes:*"
  | "attendance:*"
  | "grades:*"
  | "exams:*"
  | "reports:*"
  | "notifications:*"
  | "fees:*"
  | "settings:*"

  // Specific permissions
  | "users:read"
  | "users:write"
  | "students:read"
  | "students:write"
  | "attendance:mark"
  | "attendance:read"
  | "attendance:edit"
  | "grades:enter"
  | "grades:read"
  | "grades:publish"
  | "exams:create"
  | "exams:read"
  | "reports:generate"
  | "reports:read"
  | "notifications:send"
  | "notifications:read"
  | "fees:read"
  | "fees:pay"
  | "profile:read"
  | "profile:write";

/* =========================
   PERMISSION MAP
   (central source of truth – update here only)
========================= */
export const permissions: Record<Role, Permission[]> = {
  ADMIN: ["*"], // wildcard: full access

  TEACHER: [
    "students:read",
    "students:write",
    "attendance:mark",
    "attendance:read",
    "attendance:edit",
    "grades:enter",
    "grades:read",
    "grades:publish",
    "exams:create",
    "exams:read",
    "reports:generate",
    "reports:read",
    "notifications:read",
    "notifications:send",
    "profile:read",
    "profile:write",
  ],

  STUDENT: [
    "grades:read",
    "attendance:read",
    "profile:read",
    "profile:write",
    "notifications:read",
  ],

  PARENT: [
    "students:read",      // their own children
    "grades:read",
    "attendance:read",
    "fees:read",
    "profile:read",
    "profile:write",
    "notifications:read",
  ],
};

/* =========================
   BASIC PERMISSION CHECK
========================= */

/**
 * Check if a given role has the specified permission.
 * Supports wildcards: "*" (full access) and "resource:*" (all actions on a resource)
 * @param role The user's role
 * @param permission The permission string to check (e.g. "grades:read")
 * @returns true if the role has the permission
 */
export function hasPermission(role: Role, permission: Permission): boolean {
  // Admin has everything
  if (role === "ADMIN") return true;

  const perms = permissions[role];
  if (!perms) return false;

  // Direct match
  if (perms.includes(permission)) return true;

  // Wildcard: resource:*
  const parts = permission.split(":");
  if (parts.length === 2) {
    const resource = parts[0];
    if (perms.includes(`${resource}:*` as Permission)) return true;
  }

  // Full wildcard (should only be on ADMIN)
  if (perms.includes("*")) return true;

  return false;
}

/* =========================
   RESOURCE-SPECIFIC CHECK (optional)
========================= */

/**
 * Check permission for a specific resource instance
 * Example: can user view student #123?
 * Useful for ownership checks (e.g. parents only see their children)
 */
export function hasResourcePermission(
  role: Role,
  permission: Permission,
  resourceId: string,
  currentUserId?: string
): boolean {
  // Admin always has access
  if (role === "ADMIN") return true;

  // Example: parents can only read their own children
  if (permission === "students:read") {
    // In real app: query DB to check ownership
    // For now: allow teachers + parents
    return role === "TEACHER" || role === "PARENT";
  }

  // Fallback to regular permission check
  return hasPermission(role, permission);
}

/* =========================
   SERVER HELPERS: REQUIRE ROLE / PERMISSION
========================= */

/**
 * Throw if user is not authenticated or doesn't have one of the allowed roles.
 * Returns the session for chaining.
 * @throws Error if unauthorized or forbidden
 */
export async function requireRole(...allowedRoles: Role[]) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    throw new Error("Unauthorized: Not logged in");
  }

  const userRole = session.user.role as Role | undefined;

  if (!userRole || !allowedRoles.includes(userRole)) {
    throw new Error(
      `Forbidden: Required role(s): ${allowedRoles.join(", ")}. Your role: ${userRole || "none"}`
    );
  }

  return session;
}

/**
 * Throw if user lacks a specific permission.
 * Returns the session for chaining.
 * @throws Error if unauthorized or forbidden
 */
export async function requirePermission(permission: Permission) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    throw new Error("Unauthorized: Not logged in");
  }

  const role = session.user.role as Role | undefined;

  if (!role || !hasPermission(role, permission)) {
    throw new Error(`Forbidden: Missing permission "${permission}"`);
  }

  return session;
}

/* =========================
   CLIENT/SERVER SAFE CHECK
========================= */

/**
 * Safe permission check — returns boolean (never throws).
 * Perfect for UI conditional rendering or non-critical logic.
 */
export async function can(permission: Permission): Promise<boolean> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return false;

  const role = session.user.role as Role | undefined;
  if (!role) return false;

  return hasPermission(role, permission);
}