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
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: "ADMIN" | "TEACHER" | "STUDENT" | "PARENT" | "ACCOUNTANT";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "ADMIN" | "TEACHER" | "STUDENT" | "PARENT" | "ACCOUNTANT";
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
    error: "/auth/error",        // recommended – shows auth errors nicely
    signOut: "/auth/signout",    // optional but good practice
  },

  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60,   // 30 days – adjust as needed
  },

  callbacks: {
    async jwt({ token, user }) {
      // First sign-in: copy user data into token
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },

    async session({ session, token }) {
      // Copy token data into session.user
      if (token?.id) {
        session.user.id = token.id as string;
      }
      if (token?.role) {
        session.user.role = token.role as "ADMIN" | "TEACHER" | "STUDENT" | "PARENT" | "ACCOUNTANT";
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,

  // Enable debug logs in development
  debug: process.env.NODE_ENV === "development",

  // Optional: improve security
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // match session maxAge
  },
} satisfies import("next-auth").NextAuthOptions;

// Export handler for App Router API route
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
