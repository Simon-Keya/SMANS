"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import * as z from "zod";

// Zod schema for sign-up form validation
const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["admin", "teacher", "student", "parent"], {
    errorMap: () => ({ message: "Role must be admin, teacher, student, or parent" }),
  }),
});

export type SignUpFormData = z.infer<typeof signUpSchema>;

// Main sign-up Server Action
export async function signUpAction(data: unknown) {
  // Validate input
  const parsed = signUpSchema.safeParse(data);

  if (!parsed.success) {
    throw new Error(parsed.error.errors[0].message);
  }

  const { name, email, password, role } = parsed.data;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (existingUser) {
    throw new Error("Email already exists. Please use a different email.");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Create user in database
  try {
    await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role,
      },
    });

    // Optional: Revalidate login page or dashboard
    revalidatePath("/auth/login");
    revalidatePath("/dashboard");

    return { success: true, message: "Account created successfully!" };
  } catch (error) {
    console.error("Sign up error:", error);
    throw new Error("Failed to create account. Please try again.");
  }
}