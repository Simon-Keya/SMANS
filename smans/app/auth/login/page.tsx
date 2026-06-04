// app/auth/login/page.tsx
"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import {
  ArrowRight,
  CheckCircle2,
  GraduationCap,
  Lock,
  Mail,
} from "lucide-react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const searchParams = useSearchParams();
  const router = useRouter();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl,
    });

    if (result?.error) {
      setError("Invalid email or password. Please try again.");
    } else if (result?.ok) {
      router.push(callbackUrl);
      router.refresh(); // Refresh to update session
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex bg-base-100">
      {/* Left Branding Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-primary via-primary-focus to-primary flex-col items-center justify-center p-16 text-primary-content">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
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
          <div className="w-16 h-16 bg-white/15 border border-white/20 rounded-2xl flex items-center justify-center mx-auto mb-8 backdrop-blur-sm">
            <GraduationCap className="w-8 h-8 text-primary-content" />
          </div>

          <h1 className="text-4xl font-black tracking-tight mb-4">Welcome to SMANS</h1>
          <p className="text-white/70 text-base leading-relaxed mb-12">
            Sign in to access your personalized school dashboard.
          </p>

          <ul className="space-y-4 text-left">
            {[
              "Real-time attendance tracking",
              "Grades & exam management",
              "Fee invoicing & payments",
              "Instant school announcements",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3 text-sm text-white/80">
                <CheckCircle2 className="w-5 h-5 text-white flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Form Panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-primary-content" />
            </div>
            <span className="text-xl font-black text-base-content">SMANS</span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-black text-base-content mb-1.5">Sign in</h2>
            <p className="text-base-content/60 text-sm">
              Enter your credentials to continue
            </p>
          </div>

          {/* Success Message */}
          {searchParams.get("success") === "account_created" && (
            <div className="flex items-center gap-3 bg-success/10 border border-success text-success rounded-xl px-4 py-3 text-sm mb-6">
              <CheckCircle2 className="w-4 h-4" />
              Account created successfully! Please sign in.
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-error/10 border border-error text-error rounded-xl px-4 py-3 text-sm mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-base-content/40" />
                <Input
                  id="email"
                  type="email"
                  placeholder="user@school.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-base-content/40" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10"
                />
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <>
                  <span className="loading loading-spinner loading-sm" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          <div className="flex items-center gap-3 my-8">
            <div className="flex-1 h-px bg-base-300" />
            <span className="text-xs text-base-content/40">OR</span>
            <div className="flex-1 h-px bg-base-300" />
          </div>

          <p className="text-center text-sm">
            Don't have an account?{" "}
            <Link href="/auth/signup" className="text-primary font-medium hover:underline">
              Sign up now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}