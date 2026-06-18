// lib/auth/auth.ts
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import NextAuth, { DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// ───────────────────────────────────────────────
// Type augmentation – extends defaults, keeps name/email/image
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
export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
          include: {
            student: { select: { id: true, name: true, admissionNumber: true } },
            parent: { select: { id: true, name: true } },
          },
        });

        if (!user || !user.password) {
          return null;
        }

        // Check if account is active
        if (!user.isActive) {
          throw new Error("Your account has been deactivated. Please contact support.");
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);

        if (!isValid) {
          return null;
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
    strategy: "jwt" as const,
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
        session.user.role = token.role as "ADMIN" | "TEACHER" | "STUDENT" | "PARENT" | "ACCOUNTANT";
      }
      if (token?.isActive !== undefined) {
        session.user.isActive = token.isActive as boolean;
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,

  debug: process.env.NODE_ENV === "development",

  jwt: {
    maxAge: 30 * 24 * 60 * 60,
  },
} satisfies import("next-auth").NextAuthOptions;

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };