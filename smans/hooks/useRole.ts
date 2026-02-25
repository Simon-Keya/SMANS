// hooks/useRole.ts
"use client";

import { useAuth } from "./useAuth";

type RoleChecks = {
  role: "ADMIN" | "TEACHER" | "STUDENT" | "PARENT" | null;
  isAdmin: boolean;
  isTeacher: boolean;
  isStudent: boolean;
  isParent: boolean;
  canManageStudents: boolean;
  canMarkAttendance: boolean;
  canViewReports: boolean;
  isLoading: boolean;
};

/**
 * Quick role-based permission checks derived from useAuth
 * 
 * Returns an object with boolean flags for common role checks.
 */
export function useRole(): RoleChecks {
  const { role, isLoading } = useAuth();

  return {
    role,
    isAdmin: role === "ADMIN",
    isTeacher: role === "TEACHER",
    isStudent: role === "STUDENT",
    isParent: role === "PARENT",
    isLoading,

    // Common permission helpers (customize as needed)
    canManageStudents: role === "ADMIN" || role === "TEACHER",
    canMarkAttendance: role === "ADMIN" || role === "TEACHER",
    canViewReports: role === "ADMIN" || role === "TEACHER" || role === "PARENT",
  };
}