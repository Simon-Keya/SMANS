"use client";

import { useSearchParams } from "next/navigation";

export default function AuthErrorPage() {
  const params = useSearchParams();
  const error = params.get("error");

  return (
    <div className="auth-container">
      <h1>Authentication Error</h1>
      <p>{error || "Something went wrong during authentication."}</p>
    </div>
  );
}