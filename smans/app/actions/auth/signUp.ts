// app/actions/auth/signUp.ts
"use server";

import { sendVerificationEmail } from "@/emails/verificationEmail";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";

// Simple in-memory rate limiter
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(key: string, maxRequests: number = 5, windowMs: number = 60 * 60 * 1000): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (record && record.resetTime < now) {
    rateLimitStore.delete(key);
  }

  const current = rateLimitStore.get(key);

  if (!current) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs,
    });
    return true;
  }

  if (current.count >= maxRequests) {
    return false;
  }

  current.count++;
  rateLimitStore.set(key, current);
  return true;
}

type Role = "ADMIN" | "TEACHER" | "STUDENT" | "PARENT";

interface SignUpInput {
  name: string;
  email: string;
  password: string;
  role?: Role;
  // Student fields
  admissionNumber?: string;
  classId?: string;
  // Teacher fields
  staffNo?: string;
  // Parent fields
  phone?: string;
  occupation?: string;
  relationship?: string;
}

export async function signUpAction(data: SignUpInput) {
  console.log("🔥 signUpAction EXECUTED →", data);

  try {
    const { 
      name, 
      email, 
      password, 
      role = "STUDENT",
      admissionNumber,
      classId,
      staffNo,
      phone,
      occupation,
      relationship,
    } = data;

    if (!name?.trim() || !email?.trim() || !password?.trim()) {
      return { success: false, error: "All fields are required" };
    }

    if (password.length < 8) {
      return { success: false, error: "Password must be at least 8 characters" };
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Rate limiting (in-memory)
    const identifier = `signup:${normalizedEmail}`;
    const rateOk = checkRateLimit(identifier);

    if (!rateOk) {
      return { success: false, error: "Too many attempts. Try again later." };
    }

    // Check existing user
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return { success: false, error: "Email already in use" };
    }

    const userCount = await prisma.user.count();
    const finalRole: Role = userCount === 0 ? "ADMIN" : role;

    const hashedPassword = await bcrypt.hash(password, 12);

    // Prepare user data with role-specific fields
    const userData: any = {
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: finalRole,
      emailVerified: finalRole === "ADMIN" ? new Date() : null,
      phone: phone?.trim() || null,
    };

    // Add staff number for teachers
    if (finalRole === "TEACHER" && staffNo) {
      userData.staffNo = staffNo.trim();
    }

    // Create user
    const newUser = await prisma.user.create({
      data: userData,
    });

    console.log("🎉 User created → ID:", newUser.id, "Role:", finalRole);

    // Create role-specific records
    if (finalRole === "STUDENT") {
      // Validate required fields
      if (!admissionNumber) {
        await prisma.user.delete({ where: { id: newUser.id } });
        return { success: false, error: "Admission number is required for students" };
      }
      if (!classId) {
        await prisma.user.delete({ where: { id: newUser.id } });
        return { success: false, error: "Class is required for students" };
      }

      // Check if admission number already exists
      const existingStudent = await prisma.student.findUnique({
        where: { admissionNumber: admissionNumber.trim() },
      });

      if (existingStudent) {
        await prisma.user.delete({ where: { id: newUser.id } });
        return { success: false, error: "Admission number already exists" };
      }

      await prisma.student.create({
        data: {
          userId: newUser.id,
          name: name.trim(),
          admissionNumber: admissionNumber.trim(),
          classId: classId,
          phone: phone?.trim() || null,
          email: normalizedEmail,
          admissionDate: new Date(),
        },
      });
      console.log("🎉 Student record created for:", newUser.id);
    }

    if (finalRole === "PARENT") {
      await prisma.parent.create({
        data: {
          userId: newUser.id,
          name: name.trim(),
          phone: phone?.trim() || null,
          email: normalizedEmail,
          occupation: occupation?.trim() || null,
          relationship: relationship?.trim() || null,
        },
      });
      console.log("🎉 Parent record created for:", newUser.id);
    }

    if (finalRole === "TEACHER") {
      // Teacher-specific logic if needed
      console.log("🎉 Teacher account created for:", newUser.id);
    }

    // Verification email (skip for first admin)
    if (finalRole !== "ADMIN") {
      try {
        const token = randomBytes(32).toString("hex");
        const hashedToken = await bcrypt.hash(token, 10);

        await prisma.emailVerificationToken.create({
          data: {
            userId: newUser.id,
            token: hashedToken,
            expiresAt: new Date(Date.now() + 60 * 60 * 1000),
          },
        });

        const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email?token=${token}`;

        await sendVerificationEmail({
          to: newUser.email,
          name: newUser.name ?? "User",
          verifyUrl,
        });
      } catch (err) {
        console.error("Email sending failed (non-blocking):", err);
      }
    }

    return {
      success: true,
      message: "Account created successfully!",
      userId: newUser.id,
    };
  } catch (error: any) {
    console.error("💥 CRITICAL ERROR in signUpAction:", error);
    return { success: false, error: error.message || "Failed to create account" };
  }
}