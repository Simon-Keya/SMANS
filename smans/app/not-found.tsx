// app/not-found.tsx
import { Button } from "@/components/ui/Button";
import { AlertCircle, Home } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-base-100 px-4">
      <div className="text-center max-w-md">
        <div className="mb-8 flex justify-center">
          <AlertCircle className="h-24 w-24 text-error" />
        </div>

        <h1 className="text-8xl font-bold text-base-content mb-4">404</h1>
        <h2 className="text-3xl font-semibold text-base-content mb-6">
          Page Not Found
        </h2>

        <p className="text-lg text-muted mb-10">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="bg-primary hover:bg-primary-focus">
            <Link href="/">
              <Home className="mr-2 h-5 w-5" />
              Return to Home
            </Link>
          </Button>

          <Button asChild variant="outline" size="lg">
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>

        <p className="mt-12 text-sm text-muted">
          If you believe this is an error, please{" "}
          <Link href="/contact" className="text-primary hover:underline">
            contact support
          </Link>
          .
        </p>
      </div>
    </div>
  );
}