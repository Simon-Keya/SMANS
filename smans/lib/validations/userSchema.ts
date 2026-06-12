// validations/userSchema.ts
import { z } from 'zod';

export const signUpSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').trim(),
  email: z.string().email('Invalid email address').trim().toLowerCase(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['ADMIN', 'TEACHER', 'STUDENT', 'PARENT']),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address').trim().toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

export const profileUpdateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').trim().optional(),
  email: z.string().email('Invalid email address').trim().toLowerCase().optional(),
  phone: z.string().optional(),
});

// Schema for user update by admin
export const updateUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').trim().optional(),
  email: z.string().email('Invalid email address').trim().toLowerCase().optional(),
  phone: z.string().optional(),
  role: z.enum(['ADMIN', 'TEACHER', 'STUDENT', 'PARENT']).optional(),
  isActive: z.boolean().optional(),
});

// Schema for password change
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Please confirm your new password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Schema for forgot password
export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address').trim().toLowerCase(),
});

// Schema for reset password
export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Schema for user registration with validation (alternative approach)
export const registerSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .trim(),
  email: z.string()
    .email('Invalid email address')
    .min(1, 'Email is required')
    .toLowerCase()
    .trim(),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  role: z.enum(['ADMIN', 'TEACHER', 'STUDENT', 'PARENT']),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;