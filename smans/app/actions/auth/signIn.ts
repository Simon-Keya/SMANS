// app/actions/auth/signIn.ts
"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "@/lib/upstash/redis";

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
  console.log("🔥 signInAction called with:", { email });

  if (!email?.trim() || !password?.trim()) {
    return { success: false, error: "Email and password are required" };
  }

  const normalizedEmail = email.toLowerCase().trim();

  // Rate limiting
  const { success: rateLimitOk } = await loginLimiter.limit(normalizedEmail);
  if (!rateLimitOk) {
    return { success: false, error: "Too many login attempts. Please try again later." };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user || !user.password) {
      return { success: false, error: "Invalid email or password" };
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return { success: false, error: "Invalid email or password" };
    }

    // Check email verification (except for ADMIN)
    if (!user.emailVerified && user.role !== "ADMIN") {
      return { 
        success: false, 
        error: "Please verify your email before logging in." 
      };
    }

    console.log("✅ Login successful for:", normalizedEmail);

    // Redirect to dashboard (NextAuth session will be handled by middleware or login page)
    redirect(callbackUrl);
  } catch (error: any) {
    console.error("💥 SignIn Action Error:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}