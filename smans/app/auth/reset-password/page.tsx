"use client";

import { resetPasswordAction } from "@/app/actions/auth/resetPassword";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const schema = z.object({
  password: z.string().min(8, "Minimum 8 characters"),
});

type FormData = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const params = useSearchParams();
  const token = params.get("token");
  const router = useRouter();

  const [message, setMessage] = useState("");

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    if (!token) return;

    try {
      await resetPasswordAction(token, data.password);
      setMessage("Password reset successful.");
      setTimeout(() => router.push("/auth/login"), 2000);
    } catch {
      setMessage("Invalid or expired token.");
    }
  };

  return (
    <div className="auth-container">
      <h1>Reset Password</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <input type="password" placeholder="New Password" {...register("password")} />
        {errors.password && <p>{errors.password.message}</p>}

        <button type="submit">Reset Password</button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
}