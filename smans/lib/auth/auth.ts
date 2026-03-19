// lib/auth/auth.ts
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// ───────────────────────────────────────────────
// Type augmentation (extends defaults instead of overriding)
// This keeps name, email, image while adding id & role
// ───────────────────────────────────────────────
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  /**
   * Extend the default Session.user type
   */
  interface Session {
    user: {
      id: string;
      role: "ADMIN" | "TEACHER" | "STUDENT" | "PARENT";
    } & DefaultSession["user"]; // ← this brings back name, email, image
  }

  /**
   * Extend the User type (returned from authorize)
   */
  interface User {
    id: string;
    role: "ADMIN" | "TEACHER" | "STUDENT" | "PARENT";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "ADMIN" | "TEACHER" | "STUDENT" | "PARENT";
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
        });

        if (!user || !user.password) {
          return null;
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);

        if (!isValid) {
          return null;
        }

        // Return user object that matches the augmented User type
        return {
          id: user.id,
          name: user.name ?? null,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],

  pages: {
    signIn: "/auth/login",
    error: "/auth/error", // ← optional but recommended
  },

  session: {
    strategy: "jwt" as const,
  },

  callbacks: {
    async jwt({ token, user }) {
      // When user signs in, add id & role to token
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },

    async session({ session, token }) {
      // Add id & role from token to session.user
      if (token?.id) {
        session.user.id = token.id as string;
      }
      if (token?.role) {
        session.user.role = token.role as "ADMIN" | "TEACHER" | "STUDENT" | "PARENT";
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,

  // Optional: debug in development
  debug: process.env.NODE_ENV === "development",
} satisfies import("next-auth").NextAuthOptions;

// Export handler for API route
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
