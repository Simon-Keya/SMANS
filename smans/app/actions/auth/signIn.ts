"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

// Rate limiting (optional – requires Upstash Redis)
import { redis } from "@/lib/upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

const loginLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "5 m"),
  analytics: true,
  prefix: "ratelimit:login",
});

interface SignInInput {
  email: string;
  password: string;
  callbackUrl?: string;
}

export async function signInAction({ email, password, callbackUrl = "/dashboard" }: SignInInput) {
  if (!email?.trim() || !password?.trim()) {
    return { success: false, error: "Email and password are required" };
  }

  const normalizedEmail = email.trim().toLowerCase();

  // Rate limit by email (or IP in production)
  const { success } = await loginLimiter.limit(normalizedEmail);
  if (!success) {
    return { success: false, error: "Too many login attempts. Please try again later." };
  }

  try {
    // 1. Find user
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user || !user.password) {
      return { success: false, error: "Invalid email or password" };
    }

    // 2. Verify password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return { success: false, error: "Invalid email or password" };
    }

    // 3. Manually sign in using NextAuth's server-side flow
    // Note: In v4, we can't directly create session in server action.
    // Best workaround: redirect to NextAuth's signin endpoint with credentials

    // Build sign-in URL with credentials (NextAuth handles session creation)
    const signInUrl = `/api/auth/signin?email=${encodeURIComponent(normalizedEmail)}&password=${encodeURIComponent(password)}&callbackUrl=${encodeURIComponent(callbackUrl)}`;

    redirect(signInUrl);
  } catch (error) {
    console.error("[SIGN_IN_ERROR]", error);
    return { success: false, error: "An unexpected error occurred. Please try again." };
  }
}