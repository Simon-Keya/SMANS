// types/next-auth.d.ts

import { DefaultSession } from "next-auth";

// Extend Session.user (keep default fields + add your custom ones)
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "ADMIN" | "TEACHER" | "STUDENT" | "PARENT" | "ACCOUNTANT"; // ← added ACCOUNTANT
    } & DefaultSession["user"];
  }

  // Extend User (returned from authorize)
  interface User {
    id: string;
    role: "ADMIN" | "TEACHER" | "STUDENT" | "PARENT" | "ACCOUNTANT"; // ← added ACCOUNTANT
  }
}

// Extend JWT (stored in token)
declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "ADMIN" | "TEACHER" | "STUDENT" | "PARENT" | "ACCOUNTANT"; // ← added ACCOUNTANT
  }
}