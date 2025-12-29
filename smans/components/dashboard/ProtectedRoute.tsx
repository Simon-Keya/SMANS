"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/auth/login");
      return;
    }

    if (allowedRoles && session.user?.role && !allowedRoles.includes(session.user.role as string)) {
      router.push("/dashboard");
    }
  }, [session, status, router, allowedRoles]);

  if (status === "loading" || !session) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (allowedRoles && session.user?.role && !allowedRoles.includes(session.user.role as string)) {
    return null;
  }

  return <>{children}</>;
}