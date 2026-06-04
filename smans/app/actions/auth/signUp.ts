"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "@/lib/upstash/redis";

const limiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1 h"),
});

type Role = "ADMIN" | "TEACHER" | "STUDENT" | "PARENT";

interface Input {
  name: string;
  email: string;
  password: string;
  role?: Role;
}

export async function signUpAction(data: Input) {
  const { name, email, password, role = "STUDENT" } = data;

  if (!name || !email || !password) {
    return { success: false, error: "Missing fields" };
  }

  const normalized = email.toLowerCase();

  const { success } = await limiter.limit(normalized);
  if (!success) {
    return { success: false, error: "Too many requests" };
  }

  const exists = await prisma.user.findUnique({
    where: { email: normalized },
  });

  if (exists) {
    return { success: false, error: "User already exists" };
  }

  const count = await prisma.user.count();
  const finalRole: Role = count === 0 ? "ADMIN" : role;

  const user = await prisma.user.create({
    data: {
      name,
      email: normalized,
      password: await bcrypt.hash(password, 10),
      role: finalRole,
      emailVerified: finalRole === "ADMIN" ? new Date() : null,
    },
  });

  return {
    success: true,
    userId: user.id,
  };
}