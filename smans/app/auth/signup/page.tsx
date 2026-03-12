"use client";

import { signUpAction } from "@/app/actions/auth/signUp";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRight,
  CheckCircle2,
  GraduationCap,
  Lock,
  Mail,
  User,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["TEACHER", "STUDENT", "PARENT"]),
});

type SignUpFormData = z.infer<typeof signUpSchema>;

export default function SignUpPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  });

  const onSubmit = async (data: SignUpFormData) => {
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      await signUpAction(data);
      setSuccess(true);
      setTimeout(() => {
        router.push("/auth/login?success=account_created");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Sign up failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-base-100">

      {/* ── Left panel (branding) ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-primary via-primary-focus to-primary flex-col items-center justify-center p-16 text-primary-content">
        {/* Decorative background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-secondary/10 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-primary-content/5 blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />
        </div>

        <div className="relative z-10 max-w-sm text-center">
          {/* Logo mark */}
          <div className="w-16 h-16 bg-white/15 border border-white/20 rounded-2xl flex items-center justify-center mx-auto mb-8 backdrop-blur-sm">
            <GraduationCap className="w-8 h-8 text-primary-content" />
          </div>

          <h1 className="text-4xl font-black tracking-tight mb-4">
            Join <span className="text-secondary">SMANS</span>
          </h1>
          <p className="text-primary-content/70 text-base leading-relaxed mb-12">
            A modern, secure platform connecting students, teachers, parents, and administrators.
          </p>

          {/* Feature list */}
          <ul className="space-y-4 text-left">
            {[
              "Real-time attendance tracking",
              "Grades & exam management",
              "Fee invoicing & payments",
              "Instant school announcements",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3 text-sm text-primary-content/80">
                <CheckCircle2 className="w-5 h-5 text-secondary flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── Right panel (form) ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-primary-content" />
            </div>
            <span className="text-xl font-black text-base-content">SMANS</span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-3xl font-black text-base-content mb-1.5">Create your account</h2>
            <p className="text-base-content/50 text-sm">
              The first account registered becomes the system administrator.
            </p>
          </div>

          {/* Alerts */}
          {success && (
            <div className="flex items-center gap-3 bg-success/10 border border-success/30 text-success rounded-xl px-4 py-3 text-sm mb-6">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              Account created successfully. Redirecting to login…
            </div>
          )}
          {error && (
            <div className="bg-error/10 border border-error/30 text-error rounded-xl px-4 py-3 text-sm mb-6">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

            {/* Full Name */}
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-base-content">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-base-content/30" />
                <Input
                  placeholder="John Doe"
                  {...register("name")}
                  className={cn(
                    "pl-9 rounded-xl bg-base-200 border-neutral/40 focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all",
                    errors.name && "border-error focus:border-error focus:ring-error/30"
                  )}
                />
              </div>
              {errors.name && (
                <p className="text-xs text-error mt-1">{errors.name.message}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-base-content">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-base-content/30" />
                <Input
                  type="email"
                  placeholder="user@school.com"
                  {...register("email")}
                  className={cn(
                    "pl-9 rounded-xl bg-base-200 border-neutral/40 focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all",
                    errors.email && "border-error focus:border-error focus:ring-error/30"
                  )}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-error mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-base-content">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-base-content/30" />
                <Input
                  type="password"
                  placeholder="Minimum 8 characters"
                  {...register("password")}
                  className={cn(
                    "pl-9 rounded-xl bg-base-200 border-neutral/40 focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all",
                    errors.password && "border-error focus:border-error focus:ring-error/30"
                  )}
                />
              </div>
              {errors.password && (
                <p className="text-xs text-error mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Role */}
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-base-content">Account Type</Label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-base-content/30 z-10" />
                <select
                  {...register("role")}
                  className={cn(
                    "select select-bordered w-full pl-9 rounded-xl bg-base-200 border-neutral/40 focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all",
                    errors.role && "border-error"
                  )}
                >
                  <option value="">Select your role</option>
                  <option value="TEACHER">Teacher</option>
                  <option value="STUDENT">Student</option>
                  <option value="PARENT">Parent</option>
                </select>
              </div>
              {errors.role && (
                <p className="text-xs text-error mt-1">{errors.role.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-focus text-primary-content font-bold py-3 rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <span className="loading loading-spinner loading-sm" />
                  Creating account…
                </>
              ) : (
                <>
                  Create Account <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>

          </form>

          <p className="text-center text-sm text-base-content/50 mt-8">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-primary font-semibold hover:underline">
              Sign in
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}