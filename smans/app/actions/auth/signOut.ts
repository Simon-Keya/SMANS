"use server";

import { authOptions } from "@/lib/auth/auth"; // your authOptions
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export async function signOutAction() {
  const session = await getServerSession(authOptions);

  if (!session) {
    // Already signed out
    redirect("/auth/login");
  }

  try {
    // In v4, server-side signOut isn't directly available.
    // Common pattern: return a client-side trigger or use redirect with callback

    // Best practice: redirect to NextAuth's built-in signout endpoint
    // This handles CSRF, session destruction, etc.
    redirect("/api/auth/signout?callbackUrl=/auth/login");
  } catch (error) {
    console.error("[SIGN_OUT_ERROR]", error);
    redirect("/auth/login?error=Sign out failed");
  }
}