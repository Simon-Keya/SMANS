// app/actions/settings/twoFactorAction.ts
"use server";

import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authenticator } from "otplib";
import { applyRateLimit } from "@/lib/rate-limit";
import { encryptSecret, decryptSecret } from "@/lib/crypto/secrets";

async function getAuthenticatedUserId(): Promise<string> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");
  if (session.user.isActive === false) throw new Error("Account deactivated");
  return session.user.id;
}

function buildOtpAuthUrl(email: string, secret: string): string {
  const issuer = "SMANS";
  const account = encodeURIComponent(email);
  const encodedIssuer = encodeURIComponent(issuer);
  return `otpauth://totp/${encodedIssuer}:${account}?secret=${secret}&issuer=${encodedIssuer}&algorithm=SHA1&digits=6&period=30`;
}

/**
 * Start 2FA enrollment: generate secret, store it server-side (enabled=false),
 * return otpauth URL for QR. Client must never supply the secret on verify.
 */
export async function enable2FA() {
  const userId = await getAuthenticatedUserId();
  await applyRateLimit(`2fa-enable:${userId}`);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, twoFactorEnabled: true },
  });

  if (!user) throw new Error("User not found");
  if (user.twoFactorEnabled) throw new Error("2FA is already enabled");

  const secret = authenticator.generateSecret();
  const otpauth = buildOtpAuthUrl(user.email ?? userId, secret);

  // Store pending secret server-side; do not enable until verified
  await prisma.user.update({
    where: { id: userId },
    data: {
      twoFactorSecret: encryptSecret(secret),
      twoFactorEnabled: false,
    },
  });

  // Return otpauth only (secret is embedded in the URL for authenticator apps).
  // Do not return the raw secret separately if avoidable; clients that need it
  // can parse the otpauth URL. We still return it for backward-compatible UI.
  return { success: true, secret, otpauth };
}

/**
 * Verify the code against the server-stored pending secret and enable 2FA.
 * Ignores any secret the client might send.
 */
export async function verify2FA(code: string, _clientSecret?: string) {
  const userId = await getAuthenticatedUserId();
  await applyRateLimit(`2fa-verify:${userId}`);

  if (!code?.trim()) {
    throw new Error("Verification code is required");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { twoFactorSecret: true, twoFactorEnabled: true },
  });

  if (!user) throw new Error("User not found");
  if (user.twoFactorEnabled) throw new Error("2FA is already enabled");
  if (!user.twoFactorSecret) {
    throw new Error("No pending 2FA setup. Call enable2FA first.");
  }

  const plainSecret = decryptSecret(user.twoFactorSecret);
  const isValid = authenticator.check(code.trim(), plainSecret);
  if (!isValid) {
    throw new Error("Invalid verification code. Please try again.");
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      twoFactorEnabled: true,
      // Secret already stored; keep it. Prefer encrypting at rest in production
      // (e.g. via application-level encryption with a key from env).
    },
  });

  return { success: true, message: "2FA enabled successfully" };
}

export async function disable2FA() {
  const userId = await getAuthenticatedUserId();
  await applyRateLimit(`2fa-disable:${userId}`);

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

export async function get2FAStatus() {
  const userId = await getAuthenticatedUserId();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { twoFactorEnabled: true },
  });

  if (!user) throw new Error("User not found");

  return {
    enabled: user.twoFactorEnabled,
  };
}
