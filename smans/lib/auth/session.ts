// lib/auth/session.ts
import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

/**
 * Get the current authenticated session on the server
 * Use this in Server Components, Server Actions, Route Handlers, etc.
 */
export async function getCurrentSession() {
  const session = await getServerSession(authOptions);

  return session;
}

/**
 * Get the current authenticated user (with type safety)
 * Returns null if not authenticated
 */
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

/**
 * Require authentication — throws if not logged in
 * Use this in protected server actions or route handlers
 */
export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("You must be signed in to perform this action.");
  }

  return user;
}

/**
 * Require specific role — throws if user doesn't have required role
 */
export async function requireRole(requiredRole: "ADMIN" | "TEACHER" | "PARENT" | "STUDENT") {
  const user = await requireAuth();

  if (user.role !== requiredRole) {
    throw new Error(`You do not have permission. Required role: ${requiredRole}`);
  }

  return user;
}