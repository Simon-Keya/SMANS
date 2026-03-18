"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function verifyEmailAction(token: string) {
  if (!token) {
    throw new Error("Verification token is required.");
  }

  // Find all non-expired tokens (should be few per user)
  const records = await prisma.emailVerificationToken.findMany({
    where: {
      expiresAt: { gt: new Date() },
    },
    include: { user: true },
  });

  for (const record of records) {
    const isValid = await bcrypt.compare(token, record.token);

    if (isValid) {
      // Verify user
      await prisma.user.update({
        where: { id: record.userId },
        data: { emailVerified: new Date() },
      });

      // Delete used token
      await prisma.emailVerificationToken.delete({
        where: { id: record.id },
      });

      // Clean up other expired/old tokens for this user (optional)
      await prisma.emailVerificationToken.deleteMany({
        where: {
          userId: record.userId,
          expiresAt: { lt: new Date() },
        },
      });

      return { success: true, message: "Email verified successfully." };
    }
  }

  throw new Error("Invalid or expired verification token. Please request a new one.");
}