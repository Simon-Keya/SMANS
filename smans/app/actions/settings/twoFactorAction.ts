// app/actions/settings/twoFactor.actions.ts
"use server";

import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authenticator } from "otplib";

export async function enable2FA() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const secret = authenticator.generateSecret();

  return {
    success: true,
    secret,
    otpauth: authenticator.keyuri(
      session.user.email || session.user.id,
      "SMANS",
      secret
    ),
  };
}

export async function verify2FA(code: string, secret: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  if (!code || !secret) {
    throw new Error("Missing code or secret");
  }

  const isValid = authenticator.check(code, secret);

  if (!isValid) {
    throw new Error("Invalid code");
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      twoFactorSecret: secret,
      twoFactorEnabled: true,
    },
  });

  return { success: true, message: "2FA enabled" };
}

export async function disable2FA() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      twoFactorSecret: null,
      twoFactorEnabled: false,
    },
  });

  return { success: true, message: "2FA disabled" };
}