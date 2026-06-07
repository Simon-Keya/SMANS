// app/auth/signup/page.tsx
"use client";

import { signUpAction } from "@/app/actions/auth/signUp";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { GraduationCap, CheckCircle2, User, Mail, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
    reset,
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { role: "STUDENT" },
  });

  const onSubmit = async (data: SignUpFormData) => {
    setLoading(true);
    setError("");

    try {
      console.log("🚀 Submitting signup form:", data);

      const result = await signUpAction(data);

      if (result.success) {
        console.log("✅ Signup successful:", result);
        setSuccess(true);
        reset();

        // Redirect to login after success
        setTimeout(() => {
          router.push("/auth/login?success=account_created");
        }, 1800);
      } else {
        setError(result.error || "Failed to create account");
      }
    } catch (err: any) {
      console.error("❌ Signup error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-base-100">
      {/* Left Branding Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-primary-focus flex-col items-center justify-center p-16 text-primary-content relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff33_1px,transparent_1px)] [background-size:40px_40px]" />
        
        <div className="relative z-10 text-center max-w-sm">
          <GraduationCap className="w-20 h-20 mx-auto mb-6 text-primary-content" />
          <h1 className="text-5xl font-black mb-4">SMANS</h1>
          <p className="text-lg opacity-80">School Management System</p>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-3xl font-bold">Create Account</h2>
            <p className="text-base-content/60 mt-1">
              First user will become Administrator
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="flex items-center gap-3 bg-success/10 border border-success text-success p-4 rounded-xl mb-6">
              <CheckCircle2 className="w-5 h-5" />
              Account created successfully! Redirecting to login...
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-error/10 border border-error text-error p-4 rounded-xl mb-6">
              {error}
            </div>
          )}

          <form 
            onSubmit={handleSubmit(onSubmit)} 
            method="POST"
            noValidate
            className="space-y-5"
          >
            {/* Full Name */}
            <div>
              <Label>Full Name</Label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-base-content/40" />
                <Input
                  placeholder="Simon Keya"
                  {...register("name")}
                  className="pl-10"
                />
              </div>
              {errors.name && <p className="text-error text-sm mt-1">{errors.name.message}</p>}
            </div>

            {/* Email */}
            <div>
              <Label>Email Address</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-base-content/40" />
                <Input
                  type="email"
                  placeholder="keya8020@gmail.com"
                  {...register("email")}
                  className="pl-10"
                />
              </div>
              {errors.email && <p className="text-error text-sm mt-1">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <Label>Password</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-base-content/40" />
                <Input
                  type="password"
                  placeholder="Minimum 8 characters"
                  {...register("password")}
                  className="pl-10"
                />
              </div>
              {errors.password && <p className="text-error text-sm mt-1">{errors.password.message}</p>}
            </div>

            {/* Role */}
            <div>
              <Label>Account Type</Label>
              <select 
                {...register("role")} 
                className="select select-bordered w-full mt-1"
              >
                <option value="STUDENT">Student</option>
                <option value="TEACHER">Teacher</option>
                <option value="PARENT">Parent</option>
              </select>
            </div>

            <Button 
              type="submit" 
              disabled={loading} 
              className="w-full mt-6"
            >
              {loading ? (
                <>
                  <span className="loading loading-spinner loading-sm" />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <p className="text-center mt-6 text-sm">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}