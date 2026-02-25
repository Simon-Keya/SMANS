// hooks/useAuth.ts
"use client";

import { useSession } from "next-auth/react";
import { useMemo } from "react";

type UserRole = "ADMIN" | "TEACHER" | "STUDENT" | "PARENT" | null;

interface AuthState {
  user: any | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  role: UserRole;
  isAdmin: boolean;
  isTeacher: boolean;
  isStudent: boolean;
  isParent: boolean;
}

export function useAuth(): AuthState {
  const { data: session, status } = useSession();

  const role = (session?.user?.role as UserRole) ?? null;

  return useMemo(
    () => ({
      user: session?.user ?? null,
      isAuthenticated: status === "authenticated",
      isLoading: status === "loading",
      role,
      isAdmin: role === "ADMIN",
      isTeacher: role === "TEACHER",
      isStudent: role === "STUDENT",
      isParent: role === "PARENT",
    }),
    [session, status, role]
  );
}