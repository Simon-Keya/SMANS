// app/dashboard/settings/security/page.tsx
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { authOptions } from "@/lib/auth/auth"; // ← FIXED: correct import path
import { Key, Shield } from "lucide-react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function SecurityPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/login");
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-primary">Security Settings</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-base-100 shadow-lg border border-base-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-primary">
              <Key className="h-6 w-6" />
              Change Password
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base-content/70 mb-4">
              Update your password regularly to keep your account secure.
            </p>
            <Button className="btn-primary">Change Password</Button>
          </CardContent>
        </Card>

        <Card className="bg-base-100 shadow-lg border border-base-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-primary">
              <Shield className="h-6 w-6" />
              Two-Factor Authentication
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base-content/70 mb-4">
              Add an extra layer of security to your account.
            </p>
            <Button variant="outline">Enable 2FA</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}