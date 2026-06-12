// app/actions/auth/forgotPassword.ts
"use server";

import { sendPasswordResetEmail } from "@/emails/passwordResetEmail";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function forgotPasswordAction(email: string) {
  try {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Don't reveal if user exists or not (security best practice)
    if (!user) {
      return {
        success: true,
        message: "If an account exists with this email, you will receive a password reset link.",
      };
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // First, delete any existing token for this user
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id },
    });

    // Then create a new token
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token: hashedToken,
        expiresAt,
      },
    });

    // Send reset email
    const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`;
    await sendPasswordResetEmail({
      to: user.email,
      name: user.name || "User",
      resetUrl,
    });

    return {
      success: true,
      message: "If an account exists with this email, you will receive a password reset link.",
    };
  } catch (error) {
    console.error("Forgot password error:", error);
    throw new Error("Something went wrong. Please try again.");
  }
}