"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function verifyEmailAction(token: string) {
  const records = await prisma.emailVerificationToken.findMany({
    where: { expiresAt: { gt: new Date() } },
  });

  for (const record of records) {
    const valid = await bcrypt.compare(token, record.token);

    if (valid) {
      await prisma.user.update({
        where: { id: record.userId },
        data: { emailVerified: new Date() },
      });

      await prisma.emailVerificationToken.delete({
        where: { id: record.id },
      });

      return;
    }
  }

  throw new Error("Invalid token");
}