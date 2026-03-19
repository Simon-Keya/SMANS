"use client";

import { verifyEmailAction } from "@/app/actions/auth/verifyEmail";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { AlertCircle, ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No verification token found in the URL.");
      return;
    }

    const verify = async () => {
      setStatus("loading");
      setMessage("");

      try {
        await verifyEmailAction(token);
        setStatus("success");
        setIsSuccess(true);
        setMessage("Your email has been successfully verified!");
        // Auto-redirect after 4 seconds
        setTimeout(() => {
          router.push("/auth/login");
        }, 4000);
      } catch (err: any) {
        setStatus("error");
        setIsSuccess(false);
        setMessage(err.message || "Invalid or expired verification token. Please request a new one.");
      }
    };

    verify();
  }, [token, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-100 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Brand / Logo */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-md">
              <span className="text-primary-content text-2xl font-bold">S</span>
            </div>
            <h1 className="text-3xl font-black text-base-content tracking-tight">SMANS</h1>
          </Link>

          <h2 className="text-3xl font-bold text-base-content">
            Email Verification
          </h2>
          <p className="mt-3 text-base-content/70 text-lg">
            {status === "loading"
              ? "Verifying your email address..."
              : status === "success"
              ? "Verification complete!"
              : "Verification failed"}
          </p>
        </div>

        {/* Status Card */}
        <div className="bg-base-200 p-8 rounded-2xl border border-neutral shadow-2xl">
          {status === "loading" && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
              <p className="text-lg text-base-content">Please wait...</p>
            </div>
          )}

          {(status === "success" || status === "error") && (
            <Alert variant={isSuccess ? "default" : "destructive"} className="mb-8">
              {isSuccess ? (
                <CheckCircle2 className="h-6 w-6 text-success" />
              ) : (
                <AlertCircle className="h-6 w-6 text-error" />
              )}
              <AlertTitle>{isSuccess ? "Success" : "Error"}</AlertTitle>
              <AlertDescription className="mt-2 text-base">
                {message}
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-4">
            {status === "success" && (
              <Button
                asChild
                className="w-full bg-primary hover:bg-primary-focus py-6 text-lg"
              >
                <Link href="/auth/login">Go to Login</Link>
              </Button>
            )}

            {status === "error" && (
              <>
                <Button
                  asChild
                  variant="outline"
                  className="w-full py-6 text-lg"
                >
                  <Link href="/auth/forgot-password">
                    Request new verification link
                  </Link>
                </Button>

                <Button
                  asChild
                  className="w-full bg-primary hover:bg-primary-focus py-6 text-lg"
                >
                  <Link href="/auth/login">Back to Sign In</Link>
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Back link */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-primary hover:text-primary-focus font-medium transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}