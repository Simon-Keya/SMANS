"use client";

import { signUpAction } from "@/app/actions/auth/signUp";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { GraduationCap, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const signUpSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["TEACHER", "STUDENT", "PARENT"]),
});

type SignUpFormData = z.infer<typeof signUpSchema>;

export default function SignUpPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { role: "STUDENT" },
  });

  const onSubmit = (data: SignUpFormData) => {
    setError("");

    startTransition(async () => {
      const result = await signUpAction(data);

      if (result.success) {
        setSuccess(true);
        reset();

        setTimeout(() => {
          router.push("/auth/login?success=account_created");
        }, 1500);
      } else {
        setError(result.error || "Signup failed");
      }
    });
  };

  return (
    <div className="min-h-screen flex bg-base-100">

      {/* LEFT */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-primary-focus items-center justify-center text-primary-content">
        <div className="text-center">
          <GraduationCap className="w-20 h-20 mx-auto mb-6" />
          <h1 className="text-5xl font-black">SMANS</h1>
          <p className="opacity-80">School Management System</p>
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">

          <h2 className="text-3xl font-bold mb-6">Create Account</h2>

          {success && (
            <div className="bg-success/10 text-success p-3 rounded mb-4 flex gap-2">
              <CheckCircle2 /> Account created successfully
            </div>
          )}

          {error && (
            <div className="bg-error/10 text-error p-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            <div>
              <Label>Name</Label>
              <Input {...register("name")} />
              <p className="text-red-500 text-sm">{errors.name?.message}</p>
            </div>

            <div>
              <Label>Email</Label>
              <Input type="email" {...register("email")} />
              <p className="text-red-500 text-sm">{errors.email?.message}</p>
            </div>

            <div>
              <Label>Password</Label>
              <Input type="password" {...register("password")} />
              <p className="text-red-500 text-sm">{errors.password?.message}</p>
            </div>

            <div>
              <Label>Role</Label>
              <select {...register("role")} className="select select-bordered w-full">
                <option value="STUDENT">Student</option>
                <option value="TEACHER">Teacher</option>
                <option value="PARENT">Parent</option>
              </select>
            </div>

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Creating..." : "Create Account"}
            </Button>

          </form>

          <p className="text-center mt-4 text-sm">
            Already have an account? <Link href="/auth/login" className="text-primary">Login</Link>
          </p>

        </div>
      </div>
    </div>
  );
}