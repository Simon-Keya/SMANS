"use server";

import { sendVerificationEmail } from "@/emails/verificationEmail"; // ← now exists
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto"; // ← fixed crypto import

// Rate limit: 5 sign-ups per IP per hour
const signUpLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1 h"),
  analytics: true,
  prefix: "ratelimit:signup",
});

interface SignUpInput {
  name: string;
  email: string;
  password: string;
  role?: "TEACHER" | "STUDENT" | "PARENT";
}

export async function signUpAction({ name, email, password, role = "STUDENT" }: SignUpInput) {
  if (!name?.trim() || !email?.trim() || !password?.trim()) {
    return { success: false, error: "All fields are required" };
  }

  const normalizedEmail = email.toLowerCase().trim();

  // Rate limit
  const ip = "global"; // Replace with real IP in prod
  const { success } = await signUpLimiter.limit(ip);
  if (!success) {
    return { success: false, error: "Too many sign-up attempts. Please try again later." };
  }

  // Password strength
  if (password.length < 8) {
    return { success: false, error: "Password must be at least 8 characters" };
  }

  // Email already exists?
  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    return { success: false, error: "Email already in use" };
  }

  // First user becomes ADMIN
  const userCount = await prisma.user.count();
  const finalRole = userCount === 0 ? "ADMIN" : role;

  const hashedPassword = await bcrypt.hash(password, 12);

  const newUser = await prisma.user.create({
    data: {
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: finalRole,
      emailVerified: finalRole === "ADMIN" ? new Date() : null,
    },
  });

  // Send verification email (unless first admin)
  if (finalRole !== "ADMIN") {
    try {
      const token = randomBytes(32).toString("hex"); // ← fixed crypto
      const hashedToken = await bcrypt.hash(token, 10);

      await prisma.emailVerificationToken.create({
        data: {
          userId: newUser.id,
          token: hashedToken,
          expiresAt: new Date(Date.now() + 1000 * 60 * 60), // 1 hour
        },
      });

      const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email?token=${token}`;
      await sendVerificationEmail({
        to: newUser.email,
        name: newUser.name || "User",
        verifyUrl,
      });
    } catch (err) {
      console.error("Verification email failed:", err);
      // Don't fail signup — just log
    }
  }

  return {
    success: true,
    message: finalRole === "ADMIN" ? "First admin account created" : "Account created. Please verify your email.",
    userId: newUser.id,
  };
}