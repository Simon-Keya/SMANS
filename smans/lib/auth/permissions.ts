// lib/permissions.ts
export {}; 
import { authOptions } from "@/lib/auth/auth";
import { getServerSession } from "next-auth";

/* =========================
   ROLE & PERMISSION TYPES
========================= */

/**
 * All supported roles in the system
 */
export type Role = "ADMIN" | "TEACHER" | "STUDENT" | "PARENT" | "ACCOUNTANT";

/**
 * All possible permissions in the system (central source of truth)
 * Update this union when adding new permissions
 */
export type Permission =
  // Wildcards
  | "*"
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
  | "teachers:read"
  | "teachers:write"
  | "classes:read"
  | "classes:write"
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
  | "fees:write"
  | "profile:read"
  | "profile:write";

/* =========================
   PERMISSION MAP
========================= */
export const permissions: Record<Role, Permission[]> = {
  ADMIN: ["*"],

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
    "classes:read",
    "classes:write",
  ],

  STUDENT: [
    "grades:read",
    "attendance:read",
    "profile:read",
    "profile:write",
    "notifications:read",
    "exams:read",
  ],

  PARENT: [
    "students:read",
    "grades:read",
    "attendance:read",
    "fees:read",
    "profile:read",
    "profile:write",
    "notifications:read",
  ],

  ACCOUNTANT: [
    "fees:read",
    "fees:pay",
    "fees:write",
    "reports:read",
    "reports:generate",
    "profile:read",
    "profile:write",
    "students:read",
  ],
};

/* =========================
   PERMISSION CHECK FUNCTIONS
========================= */

/**
 * Check if a given role has the specified permission.
 */
export function hasPermission(role: Role, permission: Permission): boolean {
  if (role === "ADMIN") return true;

  const perms = permissions[role];
  if (!perms) return false;

  if (perms.includes(permission)) return true;

  const parts = permission.split(":");
  if (parts.length === 2) {
    const resource = parts[0];
    if (perms.includes(`${resource}:*` as Permission)) return true;
  }

  if (perms.includes("*")) return true;

  return false;
}

/**
 * Client-side permission check (no async, no session)
 * Use this in client components for conditional rendering
 */
export function hasClientPermission(role: Role, permission: Permission): boolean {
  return hasPermission(role, permission);
}

/**
 * Check if a role has any of the given permissions
 */
export function hasAnyPermission(role: Role, permissionsList: Permission[]): boolean {
  return permissionsList.some(p => hasPermission(role, p));
}

/**
 * Check if a role has all of the given permissions
 */
export function hasAllPermissions(role: Role, permissionsList: Permission[]): boolean {
  return permissionsList.every(p => hasPermission(role, p));
}

/* =========================
   RESOURCE-SPECIFIC CHECK
========================= */

export function hasResourcePermission(
  role: Role,
  permission: Permission,
  resourceId: string,
  currentUserId?: string
): boolean {
  if (role === "ADMIN") return true;

  if (permission === "students:read") {
    return role === "TEACHER" || role === "PARENT";
  }

  return hasPermission(role, permission);
}

/* =========================
   SERVER HELPERS
========================= */

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

export async function can(permission: Permission): Promise<boolean> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return false;

  const role = session.user.role as Role | undefined;
  if (!role) return false;

  return hasPermission(role, permission);
}

// Re-export commonly used types for convenience
export type { Role as AppRole, Permission as AppPermission };