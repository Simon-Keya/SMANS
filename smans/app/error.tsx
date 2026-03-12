// app/error.tsx
"use client";

import { Button } from "@/components/ui/Button";
import { AlertCircle, Home, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service (Sentry, etc.)
    console.error("Global error boundary caught:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-base-100 px-4">
      <div className="text-center max-w-md">
        <div className="mb-8 flex justify-center">
          <AlertCircle className="h-20 w-20 text-error" />
        </div>

        <h2 className="text-3xl font-bold text-base-content mb-4">
          Something went wrong!
        </h2>

        <p className="text-lg text-muted mb-8">
          {error.message || "An unexpected error occurred."}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => reset()}
            className="bg-primary hover:bg-primary-focus"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Try again
          </Button>

          <Button asChild variant="outline">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Return to Home
            </Link>
          </Button>
        </div>

        {process.env.NODE_ENV === "development" && (
          <div className="mt-10 p-4 bg-error/10 border border-error/30 rounded-lg text-left text-sm text-error">
            <p className="font-medium mb-2">Error details (development only):</p>
            <pre className="whitespace-pre-wrap break-words">{error.stack}</pre>
          </div>
        )}
      </div>
    </div>
  );
}