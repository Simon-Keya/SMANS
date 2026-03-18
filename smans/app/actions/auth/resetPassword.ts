"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function resetPasswordAction(token: string, newPassword: string) {
  if (!token || !newPassword) {
    throw new Error("Token and new password are required.");
  }

  if (newPassword.length < 8) {
    throw new Error("Password must be at least 8 characters long.");
  }

  // Find valid, non-expired token
  const resetToken = await prisma.passwordResetToken.findFirst({
    where: {
      token: await bcrypt.hash(token, 10), // Match hashed version
      expiresAt: { gt: new Date() },
    },
    include: { user: true },
  });

  if (!resetToken || !resetToken.user) {
    throw new Error("Invalid or expired reset token. Please request a new one.");
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update password
  await prisma.user.update({
    where: { id: resetToken.userId },
    data: { password: hashedPassword },
  });

  // Delete used token
  await prisma.passwordResetToken.delete({
    where: { id: resetToken.id },
  });

  // Clean up other tokens for this user
  await prisma.passwordResetToken.deleteMany({
    where: { userId: resetToken.userId },
  });

  return { success: true, message: "Password reset successful." };
}