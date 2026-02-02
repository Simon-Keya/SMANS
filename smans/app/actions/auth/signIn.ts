"use server";

import { signIn } from "next-auth";

export async function signInAction(email: string, password: string) {
  if (!email.trim() || !password.trim()) {
    return { success: false, error: "Email and password are required" };
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    return { success: true, message: "Signed in successfully" };
  } catch (error) {
    console.error("[SIGN_IN_ERROR]", error);

    if (error instanceof Error) {
      return { success: false, error: error.message || "Authentication failed" };
    }

    return { success: false, error: "An unexpected error occurred" };
  }
}
