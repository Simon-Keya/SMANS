"use server";

import { sendPasswordResetEmail } from "@/emails/passwordResetEmail";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/upstash/redis"; // if you have Upstash Redis
import { Ratelimit } from "@upstash/ratelimit";
import bcrypt from "bcryptjs";
import crypto from "crypto";

// Rate limiter: max 5 reset requests per email per 10 minutes
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "10 m"),
  analytics: true,
  prefix: "ratelimit:forgot-password",
});

export async function forgotPasswordAction(email: string) {
  if (!email || typeof email !== "string") {
    throw new Error("Invalid email provided.");
  }

  const normalizedEmail = email.toLowerCase().trim();

  // Apply rate limiting
  const { success, limit, remaining, reset } = await ratelimit.limit(normalizedEmail);

  if (!success) {
    const waitMinutes = Math.ceil((reset - Date.now()) / 1000 / 60);
    throw new Error(
      `Too many password reset requests. Please wait ${waitMinutes} minute${waitMinutes > 1 ? "s" : ""} and try again.`
    );
  }

  // Find user (don't reveal if user exists or not)
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  // Always return success to prevent user enumeration
  if (!user) {
    console.warn(`Password reset requested for non-existent email: ${normalizedEmail}`);
    return { success: true, message: "If an account exists, a reset link has been sent." };
  }

  // Delete any existing reset tokens for this user
  await prisma.passwordResetToken.deleteMany({
    where: { userId: user.id },
  });

  // Generate secure token
  const token = crypto.randomBytes(32).toString("hex");
  const hashedToken = await bcrypt.hash(token, 10);

  // Store hashed token with 1-hour expiry
  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      token: hashedToken,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60), // 1 hour
    },
  });

  // Build secure reset URL
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const resetUrl = `${appUrl}/auth/reset-password?token=${token}`;

  try {
    // Send email (implement your email service)
    await sendPasswordResetEmail({
      to: user.email,
      name: user.name || "User",
      resetUrl,
    });

    return {
      success: true,
      message: "If an account exists, a reset link has been sent to your email.",
    };
  } catch (err) {
    console.error("Failed to send password reset email:", err);
    throw new Error("Failed to send reset email. Please try again later.");
  }
}