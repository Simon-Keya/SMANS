// app/actions/settings/twoFactor.actions.ts
"use server";

import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authenticator } from "otplib";

async function getAuthenticatedUserId(): Promise<string> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

export async function enable2FA() {
  const userId = await getAuthenticatedUserId();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, twoFactorEnabled: true },
  });

  if (!user) throw new Error("User not found");
  if (user.twoFactorEnabled) throw new Error("2FA is already enabled");

  const secret = authenticator.generateSecret();
  const otpauth = authenticator.keyuri(user.email ?? userId, "SMANS", secret);

  return { success: true, secret, otpauth };
}

export async function verify2FA(code: string, secret: string) {
  const userId = await getAuthenticatedUserId();

  if (!code?.trim() || !secret?.trim()) {
    throw new Error("Verification code and secret are required");
  }

  const isValid = authenticator.check(code, secret);
  if (!isValid) {
    throw new Error("Invalid verification code. Please try again.");
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      twoFactorSecret: secret,
      twoFactorEnabled: true,
    },
  });

  return { success: true, message: "2FA enabled successfully" };
}

export async function disable2FA() {
  const userId = await getAuthenticatedUserId();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { twoFactorEnabled: true },
  });

  if (!user) throw new Error("User not found");
  if (!user.twoFactorEnabled) throw new Error("2FA is not currently enabled");

  await prisma.user.update({
    where: { id: userId },
    data: {
      twoFactorSecret: null,
      twoFactorEnabled: false,
    },
  });

  return { success: true, message: "2FA disabled successfully" };
}