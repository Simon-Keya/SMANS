"use server";

import { AuthError } from "next-auth";
import { signIn } from "next-auth/react";

export async function signInAction(
  email: string,
  password: string
) {
  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Invalid email or password" };
    }
    return { error: "Something went wrong" };
  }
}
