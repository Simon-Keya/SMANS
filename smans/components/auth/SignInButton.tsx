"use client";

import { Button } from "@/components/ui/Button";
import { LogOut } from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";

export default function SignInButton() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <Button disabled>Loading...</Button>;
  }

  if (session) {
    return (
      <Button variant="outline" onClick={() => signOut()}>
        <LogOut className="mr-2 h-4 w-4" />
        Sign Out
      </Button>
    );
  }

  return (
    <Button onClick={() => signIn()}>
      Sign In
    </Button>
  );
}