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

    // ── Validation ──────────────────────────────────────────────────────────

    if (!name?.trim() || !email?.trim() || !password?.trim()) {
      return { success: false, error: "All fields are required" };
    }

    if (password.length < 8) {
      return { success: false, error: "Password must be at least 8 characters" };
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Role-specific validation
    if (role === "STUDENT") {
      if (!admissionNumber?.trim()) {
        return { success: false, error: "Admission number is required for students" };
      }
      if (!classId?.trim()) {
        return { success: false, error: "Class is required for students" };
      }
    }

    if (role === "TEACHER" && !staffNo?.trim()) {
      return { success: false, error: "Staff number is required for teachers" };
    }

    // ── Rate Limiting ──────────────────────────────────────────────────────

    const identifier = `signup:${normalizedEmail}`;
    const rateOk = checkRateLimit(identifier);

    if (!rateOk) {
      return { success: false, error: "Too many attempts. Try again later." };
    }

    // ──────────────────────────────────────────────

    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return { success: false, error: "Email already in use" };
    }

    // ── Create User ──────────────────────────────────────────────────────

    const userCount = await prisma.user.count();
    const finalRole: Role = userCount === 0 ? "ADMIN" : role;

    const hashedPassword = await bcrypt.hash(password, 12);

    const userData: any = {
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: finalRole,
      emailVerified: finalRole === "ADMIN" ? new Date() : null,
      phone: phone?.trim() || null,
    };

    if (finalRole === "TEACHER" && staffNo) {
      userData.staffNo = staffNo.trim();
    }

    // Create user
    const newUser = await prisma.user.create({
      data: userData,
    });

    console.log("🎉 User created → ID:", newUser.id, "Role:", finalRole);

    // ── Create Role-Specific Records ────────────────────────────────────

    if (finalRole === "STUDENT") {
      // Find or create the class
      let actualClassId = classId;
      let classRecord = null;

      // Try to find class by ID first (if it's a valid ID format)
      if (classId && classId.length > 10) {
        classRecord = await prisma.class.findUnique({
          where: { id: classId },
        });
      }

      // If not found by ID, try to find by name
      if (!classRecord && classId) {
        classRecord = await prisma.class.findFirst({
          where: { 
            name: { equals: classId.trim(), mode: 'insensitive' }
          },
        });
      }

      // If still not found, create a new class
      if (!classRecord && classId) {
        classRecord = await prisma.class.create({
          data: {
            name: classId.trim(),
            level: "Unknown",
          },
        });
        console.log("📚 Created new class:", classRecord.name, "with ID:", classRecord.id);
      }

      if (!classRecord) {
        await prisma.user.delete({ where: { id: newUser.id } });
        return { success: false, error: "Failed to find or create class" };
      }

      actualClassId = classRecord.id;

      // Check if admission number already exists
      const existingStudent = await prisma.student.findUnique({
        where: { admissionNumber: admissionNumber!.trim() },
      });

      if (existingStudent) {
        await prisma.user.delete({ where: { id: newUser.id } });
        return { success: false, error: "Admission number already exists" };
      }

      // Create student
      await prisma.student.create({
        data: {
          userId: newUser.id,
          name: name.trim(),
          admissionNumber: admissionNumber!.trim(),
          classId: actualClassId,
          phone: phone?.trim() || null,
          email: normalizedEmail,
          admissionDate: new Date(),
        },
      });
      console.log("🎉 Student record created for:", newUser.id);
    }

    if (finalRole === "PARENT") {
      // Check if email already exists in Parent table
      if (email) {
        const existingParent = await prisma.parent.findFirst({
          where: { email: normalizedEmail },
        });

        if (existingParent) {
          await prisma.user.delete({ where: { id: newUser.id } });
          return { success: false, error: "Email already registered as a parent" };
        }
      }

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
      // Teacher-specific logic (if needed)
      // Additional teacher profile setup can go here
      console.log("🎉 Teacher account created for:", newUser.id);
    }

    // ── Email Verification ──────────────────────────────────────────────

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

        const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL}/auth/verify-email?token=${token}`;

        await sendVerificationEmail({
          to: newUser.email,
          name: newUser.name ?? "User",
          verifyUrl,
        });

        console.log("📧 Verification email sent to:", newUser.email);
      } catch (err) {
        console.error("Email sending failed (non-blocking):", err);
        // Don't fail the signup if email fails
      }
    }

    // ── Success ──────────────────────────────────────────────────────────

    return {
      success: true,
      message: "Account created successfully! Please check your email to verify your account.",
      userId: newUser.id,
    };
  } catch (error: any) {
    console.error("💥 CRITICAL ERROR in signUpAction:", error);
    
    // Handle specific Prisma errors
    if (error.code === "P2002") {
      return { success: false, error: "Email or admission number already in use" };
    }
    
    if (error.code === "P2003") {
      return { success: false, error: "Invalid class ID. Please select a valid class." };
    }

    return { success: false, error: error.message || "Failed to create account" };
  }
}