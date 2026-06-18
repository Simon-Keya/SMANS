// app/actions/auth/signIn.ts
"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";

// Simple in-memory rate limiter
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(key: string, maxRequests: number = 10, windowMs: number = 5 * 60 * 1000): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  // Clean up expired
  if (record && record.resetTime < now) {
    rateLimitStore.delete(key);
  }

  const current = rateLimitStore.get(key);

  if (!current) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs,
    });
    return true;
  }

  if (current.count >= maxRequests) {
    return false;
  }

  current.count++;
  rateLimitStore.set(key, current);
  return true;
}

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

  // Rate limiting (in-memory)
  const identifier = `login:${normalizedEmail}`;
  const rateLimitOk = checkRateLimit(identifier);

  if (!rateLimitOk) {
    return { success: false, error: "Too many login attempts. Please try again later." };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: {
        student: { select: { id: true, name: true, admissionNumber: true } },
        parent: { select: { id: true, name: true } },
      },
    });

    if (!user || !user.password) {
      return { success: false, error: "Invalid email or password" };
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return { success: false, error: "Invalid email or password" };
    }

    // Check if user is active
    if (!user.isActive) {
      return { 
        success: false, 
        error: "Your account has been deactivated. Please contact support." 
      };
    }

    // Check email verification (except for ADMIN)
    if (!user.emailVerified && user.role !== "ADMIN") {
      return { 
        success: false, 
        error: "Please verify your email before logging in." 
      };
    }

    console.log("✅ Login successful for:", normalizedEmail);

    // Redirect to dashboard
    redirect(callbackUrl);
  } catch (error: any) {
    // If it's a redirect, re-throw it
    if (error.message?.includes('NEXT_REDIRECT')) {
      throw error;
    }
    console.error("💥 SignIn Action Error:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}