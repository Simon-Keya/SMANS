"use server";

import { AuthError } from "next-auth/errors"; // ← official v5 path
import { signIn } from "next-auth/react";

export async function signInAction(
  email: string,
  password: string
) {
  if (!email.trim() || !password.trim()) {
    return { success: false, error: "Email and password are required" };
  }

  try {
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      return { success: false, error: result.error };
    }

    return { success: true, message: "Signed in successfully" };
  } catch (error) {
    console.error("[SIGN_IN_ERROR]", error);

    if (error instanceof AuthError) {
      return { success: false, error: "Authentication failed" };
    }

    return { success: false, error: "An unexpected error occurred" };
  }
}