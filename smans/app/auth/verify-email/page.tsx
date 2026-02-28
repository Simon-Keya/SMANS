"use client";

import { verifyEmailAction } from "@/app/actions/auth/verifyEmail";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function VerifyEmailPage() {
  const params = useSearchParams();
  const token = params.get("token");

  const [message, setMessage] = useState("Verifying...");

  useEffect(() => {
    if (!token) return;

    verifyEmailAction(token)
      .then(() => setMessage("Email verified successfully!"))
      .catch(() => setMessage("Invalid or expired token."));
  }, [token]);

  return (
    <div className="auth-container">
      <h1>Email Verification</h1>
      <p>{message}</p>
    </div>
  );
}