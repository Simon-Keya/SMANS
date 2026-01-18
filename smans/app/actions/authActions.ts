"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import * as z from "zod";

// Zod schema for sign-up form validation
const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["admin", "teacher", "student", "parent"], {
    required_error: "Please select your role",
    invalid_type_error: "Invalid role selected",
  }),
});

export type SignUpFormData = z.infer<typeof signUpSchema>;

/**
 * Server Action: Create a new user account
 * @throws Error with user-friendly message on failure
 */
export async function signUpAction(data: unknown) {
  // 1. Validate input data
  const parsed = signUpSchema.safeParse(data);

  if (!parsed.success) {
    // Return first validation error (most user-friendly)
    throw new Error(parsed.error.errors[0].message);
  }

  const { name, email, password, role } = parsed.data;

  try {
    // 2. Check for duplicate email (case-insensitive)
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      throw new Error("This email is already registered. Please use a different email.");
    }

    // 3. Hash password (12 rounds is secure & standard)
    const hashedPassword = await bcrypt.hash(password, 12);

    // 4. Create user
    await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role,
      },
    });

    // 5. Revalidate affected pages (optional but good for cache)
    revalidatePath("/auth/login");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: "Account created successfully! You can now sign in.",
    };
  } catch (error) {
    // Log for debugging (won't show to user)
    console.error("[SIGN_UP_ACTION_ERROR]", error);

    // User-friendly error messages
    if (error instanceof z.ZodError) {
      throw new Error(error.errors[0].message);
    }

    if (error instanceof Error && error.message.includes("Unique constraint")) {
      throw new Error("This email is already taken.");
    }

    throw new Error("Unable to create account at this time. Please try again later.");
  }
}