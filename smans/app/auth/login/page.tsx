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
  Shield,
} from "lucide-react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [needs2FA, setNeeds2FA] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [redirecting, setRedirecting] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  useEffect(() => {
    if (redirecting) {
      const timer = setTimeout(() => setRedirecting(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [redirecting]);

  const mapError = (code?: string | null): string => {
    if (!code) return "Invalid email or password. Please try again.";
    if (code.includes("ACCOUNT_DEACTIVATED"))
      return "Your account has been deactivated. Please contact support.";
    if (code.includes("EMAIL_NOT_VERIFIED"))
      return "Please verify your email before logging in.";
    if (code.includes("INVALID_2FA") || code.includes("2FA"))
      return "Invalid authentication code. Please try again.";
    if (code.includes("Too many"))
      return "Too many attempts. Please try again later.";
    return "Invalid email or password. Please try again.";
  };

  const completeSignIn = async (withTotp: string) => {
    const result = await signIn("credentials", {
      email,
      password,
      totpCode: withTotp,
      redirect: false,
      callbackUrl,
    });

    if (result?.error) {
      setError(mapError(result.error));
      setLoading(false);
      return;
    }

    if (result?.ok) {
      setRedirecting(true);
      router.push(callbackUrl);
      router.refresh();
      setTimeout(() => {
        window.location.href = callbackUrl;
      }, 500);
      return;
    }

    setError("Something went wrong. Please try again.");
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setRedirecting(false);

    try {
      if (needs2FA) {
        await completeSignIn(totpCode);
        return;
      }

      // Step 1: password gate — discover whether 2FA is required
      const checkRes = await fetch("/api/auth/check-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const check = await checkRes.json().catch(() => ({}));

      if (!checkRes.ok || !check.ok) {
        setError(mapError(check.error));
        setLoading(false);
        return;
      }

      if (check.requires2FA) {
        setNeeds2FA(true);
        setLoading(false);
        return;
      }

      // No 2FA — finish with NextAuth
      await completeSignIn("");
    } catch (err) {
      console.error("Login error:", err);
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-base-100">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-primary via-primary-focus to-primary flex-col items-center justify-center p-16 text-primary-content">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
        </div>
        <div className="relative z-10 max-w-sm text-center">
          <div className="w-16 h-16 bg-white/15 border border-white/20 rounded-2xl flex items-center justify-center mx-auto mb-8 backdrop-blur-sm">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold mb-3">SMANS</h1>
          <p className="text-primary-content/80 text-sm leading-relaxed">
            Kenya CBC School Management — secure access for administrators,
            teachers, parents, and students.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-base-content">
              {needs2FA ? "Two-factor authentication" : "Welcome back"}
            </h2>
            <p className="text-base-content/60 text-sm mt-1">
              {needs2FA
                ? "Enter the 6-digit code from your authenticator app"
                : "Sign in to your SMANS account"}
            </p>
          </div>

          {searchParams.get("success") === "account_created" && (
            <div className="flex items-center gap-3 bg-success/10 border border-success text-success rounded-xl px-4 py-3 text-sm mb-6">
              <CheckCircle2 className="w-4 h-4" />
              Account created successfully! Please sign in.
            </div>
          )}

          {redirecting && (
            <div className="flex items-center gap-3 bg-primary/10 border border-primary text-primary rounded-xl px-4 py-3 text-sm mb-6 animate-pulse">
              <span className="loading loading-spinner loading-sm" />
              Redirecting to dashboard...
            </div>
          )}

          {error && (
            <div className="bg-error/10 border border-error text-error rounded-xl px-4 py-3 text-sm mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!needs2FA ? (
              <>
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
                      autoComplete="email"
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
                      autoComplete="current-password"
                      className="pl-10"
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-1.5">
                <Label htmlFor="totp">Authentication code</Label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-base-content/40" />
                  <Input
                    id="totp"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    placeholder="000000"
                    value={totpCode}
                    onChange={(e) =>
                      setTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    required
                    autoFocus
                    autoComplete="one-time-code"
                    className="pl-10 tracking-widest text-center text-lg"
                  />
                </div>
                <button
                  type="button"
                  className="text-xs text-primary hover:underline mt-1"
                  onClick={() => {
                    setNeeds2FA(false);
                    setTotpCode("");
                    setError("");
                  }}
                >
                  ← Back to email & password
                </button>
              </div>
            )}

            <Button type="submit" disabled={loading || redirecting} className="w-full">
              {loading ? (
                <>
                  <span className="loading loading-spinner loading-sm" />
                  {needs2FA ? "Verifying..." : "Signing in..."}
                </>
              ) : redirecting ? (
                <>
                  <span className="loading loading-spinner loading-sm" />
                  Redirecting...
                </>
              ) : (
                <>
                  {needs2FA ? "Verify & sign in" : "Sign In"}{" "}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          {!needs2FA && (
            <>
              <div className="flex items-center gap-3 my-8">
                <div className="flex-1 h-px bg-base-300" />
                <span className="text-xs text-base-content/40">OR</span>
                <div className="flex-1 h-px bg-base-300" />
              </div>
              <p className="text-center text-sm">
                Don&apos;t have an account?{" "}
                <Link
                  href="/auth/signup"
                  className="text-primary font-medium hover:underline"
                >
                  Sign up now
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
