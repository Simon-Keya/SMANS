// app/loading.tsx
import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-base-100">
      <div className="text-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto mb-6" />
        <h2 className="text-2xl font-semibold text-base-content mb-3">
          Loading SMANS...
        </h2>
        <p className="text-muted">
          Please wait while we prepare your dashboard
        </p>
      </div>
    </div>
  );
}