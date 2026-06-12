// app/actions/auth/resetPassword.ts
"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export async function resetPasswordAction(token: string, newPassword: string) {
  try {
    if (!token || !newPassword) {
      throw new Error("Invalid request.");
    }

    // Hash the token to compare with stored hash
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find the token in the database
    const resetToken = await prisma.passwordResetToken.findFirst({
      where: {
        token: hashedToken,
        expiresAt: { gt: new Date() },
      },
    });

    if (!resetToken) {
      throw new Error("Invalid or expired reset token.");
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user's password
    await prisma.user.update({
      where: { id: resetToken.userId },
      data: { password: hashedPassword },
    });

    // Delete the used token
    await prisma.passwordResetToken.delete({
      where: { id: resetToken.id },
    });

    return {
      success: true,
      message: "Password reset successfully.",
    };
  } catch (error) {
    console.error("Reset password error:", error);
    throw new Error("Failed to reset password. Please try again.");
  }
}