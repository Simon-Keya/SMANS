import SignInButton from "@/components/auth/SignInButton"; // ← Fixed: default import
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"; // ← Removed CardDescription
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Welcome Back</CardTitle>
          {/* Replaced CardDescription with a regular p tag */}
          <p className="text-sm text-muted-foreground text-center">
            Sign in to your school management account
          </p>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          <div className="text-center text-sm text-muted-foreground">
            Use your credentials to continue
          </div>
          <SignInButton />
          <p className="text-xs text-muted-foreground">
            Demo mode: Click "Sign In" to log in with a default account (or set up providers in auth config)
          </p>
        </CardContent>
      </Card>
    </div>
  );
}