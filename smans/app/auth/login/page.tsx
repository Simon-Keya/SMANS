// app/auth/login/page.tsx
"use client";

import { Alert, AlertDescription } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
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

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl,
    });

    if (res?.error) {
      setError("Invalid email or password. Please try again.");
    } else {
      router.push(callbackUrl);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-100 p-4">
      <Card className="w-full max-w-md border border-neutral bg-base-100 shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold text-primary">
            Sign In to SMANS
          </CardTitle>
          <p className="text-sm text-muted">
            Access your personalized school dashboard
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {searchParams.get("success") === "account_created" && (
            <Alert className="bg-success/10 text-success border-success/30">
              <AlertDescription>
                Account created successfully! Please sign in.
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-base-content">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@smans.ac.ke"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                className="bg-base-200 border-neutral focus:border-primary focus:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-base-content">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-base-200 border-neutral focus:border-primary focus:ring-primary"
              />
            </div>

            {error && (
              <Alert variant="destructive" className="border-error/30 bg-error/10">
                <AlertDescription className="text-error">{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary-focus text-primary-content"
              disabled={loading}
            >
              {loading ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="divider my-6 text-muted">OR</div>

          <div className="text-center text-sm">
            Don't have an account?{" "}
            <Link
              href="/auth/signup"
              className="text-primary hover:underline font-medium"
            >
              Sign up now
            </Link>
          </div>

          <p className="text-xs text-center text-muted mt-6">
            Demo: <strong>admin@smans.ac.ke</strong> / <strong>password</strong>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}