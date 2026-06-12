// lib/auth/session.ts
import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

export async function getCurrentSession() {
  const session = await getServerSession(authOptions);
  return session;
}

export async function getCurrentUser() {
  const session = await getCurrentSession();

  if (!session?.user) {
    return null;
  }

  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    role: session.user.role,
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
    throw new Error(`You do not have permission. Required role: ${requiredRole}`);
  }
  return user;
}