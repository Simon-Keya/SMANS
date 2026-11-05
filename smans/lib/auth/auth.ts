// lib/auth/auth.ts
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { authenticator } from "otplib";
import { decryptSecret } from "@/lib/crypto/secrets";
import type { DefaultSession, NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// ───────────────────────────────────────────────
// Type augmentation
// ───────────────────────────────────────────────
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "ADMIN" | "TEACHER" | "STUDENT" | "PARENT" | "ACCOUNTANT";
      isActive?: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: "ADMIN" | "TEACHER" | "STUDENT" | "PARENT" | "ACCOUNTANT";
    isActive?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "ADMIN" | "TEACHER" | "STUDENT" | "PARENT" | "ACCOUNTANT";
    isActive?: boolean;
  }
}

// ───────────────────────────────────────────────
// Auth configuration
// ───────────────────────────────────────────────
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        totpCode: { label: "2FA Code", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email.toLowerCase().trim();
        const totpCode =
          typeof credentials.totpCode === "string"
            ? credentials.totpCode.trim()
            : "";

        const user = await prisma.user.findUnique({
          where: { email },
          select: {
            id: true,
            name: true,
            email: true,
            password: true,
            role: true,
            isActive: true,
            emailVerified: true,
            twoFactorEnabled: true,
            twoFactorSecret: true,
          },
        });

        if (!user || !user.password) {
          return null;
        }

        if (!user.isActive) {
          throw new Error("ACCOUNT_DEACTIVATED");
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          return null;
        }

        // Email verification (admins exempt)
        if (!user.emailVerified && user.role !== "ADMIN") {
          throw new Error("EMAIL_NOT_VERIFIED");
        }

        // 2FA challenge
        if (user.twoFactorEnabled) {
          if (!user.twoFactorSecret) {
            // Misconfigured account — fail closed
            throw new Error("2FA_MISCONFIGURED");
          }
          if (!totpCode) {
            // Signal client to show second step
            throw new Error("2FA_REQUIRED");
          }
          const ok = authenticator.check(totpCode, decryptSecret(user.twoFactorSecret));
          if (!ok) {
            throw new Error("INVALID_2FA_CODE");
          }
        }

        return {
          id: user.id,
          name: user.name ?? null,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
        };
      },
    }),
  ],

  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
    signOut: "/auth/signout",
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.isActive = user.isActive;
      }
      return token;
    },

    async session({ session, token }) {
      if (token?.id) {
        session.user.id = token.id as string;
      }
      if (token?.role) {
        session.user.role = token.role as
          | "ADMIN"
          | "TEACHER"
          | "STUDENT"
          | "PARENT"
          | "ACCOUNTANT";
      }
      if (token?.isActive !== undefined) {
        session.user.isActive = token.isActive as boolean;
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      try {
        if (new URL(url).origin === baseUrl) return url;
      } catch {
        // ignore invalid URL
      }
      return baseUrl;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,

  debug: process.env.NODE_ENV === "development",

  jwt: {
    maxAge: 30 * 24 * 60 * 60,
  },
};
