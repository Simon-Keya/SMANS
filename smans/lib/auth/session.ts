// lib/auth/session.ts
import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

export async function getCurrentSession() {
  try {
    const session = await getServerSession(authOptions);
    return session;
  } catch (error) {
    console.error("❌ Error getting session:", error);
    return null;
  }
}

export async function getCurrentUser() {
  const session = await getCurrentSession();

  if (!session?.user?.id) {
    return null;
  }

  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    role: session.user.role,
    isActive: session.user.isActive ?? true, // Default to true if not set
  };
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("You must be signed in to perform this action.");
  }
  return user;
}

export async function requireRole(requiredRole: "ADMIN" | "TEACHER" | "PARENT" | "STUDENT" | "ACCOUNTANT") {
  const user = await requireAuth();
  if (user.role !== requiredRole) {
    throw new Error(`Access denied. Required role: ${requiredRole}`);
  }
  return user;
}

export async function requireActive() {
  const user = await requireAuth();
  if (user.isActive === false) {
    throw new Error("Your account has been deactivated.");
  }
  return user;
}

export async function hasRole(role: "ADMIN" | "TEACHER" | "PARENT" | "STUDENT" | "ACCOUNTANT"): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.role === role;
}

export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return !!user;
}