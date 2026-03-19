import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { authOptions } from "@/lib/auth/auth";
import { Edit, Mail, Shield } from "lucide-react";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";



export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/login");
  }

  const user = session.user;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-primary">My Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-1 bg-base-100 shadow-lg border border-base-200">
          <CardHeader className="text-center">
            <Avatar className="w-32 h-32 mx-auto">
              <AvatarImage src={user.image ?? ""} alt={user.name ?? "User"} />
              <AvatarFallback className="bg-primary text-primary-content text-4xl">
                {user.name?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <CardTitle className="mt-4 text-2xl text-primary">
              {user.name || "User"}
            </CardTitle>
            <p className="text-base-content/70 capitalize">{user.role || "Role"}</p>
          </CardHeader>
          <CardContent className="text-center space-y-3">
            <p className="flex items-center justify-center gap-2">
              <Mail className="h-4 w-4 text-primary" />
              {user.email || "No email set"}
            </p>
            {/* Add more fields like phone, joined date, etc. when available */}
          </CardContent>
        </Card>

        {/* Details & Actions */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-base-100 shadow-lg border border-base-200">
            <CardHeader>
              <CardTitle className="text-xl text-primary">Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-base-content/60">Full Name</p>
                <p className="font-medium">{user.name || "Not set"}</p>
              </div>
              <div>
                <p className="text-sm text-base-content/60">Email</p>
                <p className="font-medium">{user.email || "Not set"}</p>
              </div>
              <div>
                <p className="text-sm text-base-content/60">Role</p>
                <p className="font-medium capitalize">{user.role}</p>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Button asChild variant="outline" className="h-24 flex flex-col gap-2">
              <Link href="/dashboard/profile/security">
                <Shield className="h-6 w-6 text-primary" />
                Security Settings
              </Link>
            </Button>

            <Button asChild variant="outline" className="h-24 flex flex-col gap-2">
              <Link href="/dashboard/profile/edit">
                <Edit className="h-6 w-6 text-primary" />
                Edit Profile
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}