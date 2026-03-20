// app/dashboard/profile/page.tsx
import { Avatar, AvatarFallback } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { Edit, Mail, Shield, Calendar, BadgeCheck, Hash } from "lucide-react";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  // Fetch full user record from DB — session only carries id, name, email, role
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      staffNo: true,
      emailVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    notFound();
  }

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-primary">My Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-1 bg-base-100 shadow-lg border border-base-200">
          <CardHeader className="text-center">
            <Avatar className="w-32 h-32 mx-auto">
              {/* No image field in schema — initials fallback only */}
              <AvatarFallback className="bg-primary text-primary-content text-4xl">
                {initials}
              </AvatarFallback>
            </Avatar>

            <CardTitle className="mt-4 text-2xl text-primary">
              {user.name ?? "Unnamed User"}
            </CardTitle>
            <p className="text-base-content/70 capitalize">{user.role.toLowerCase()}</p>

            {/* Email verification badge */}
            {user.emailVerified ? (
              <span className="inline-flex items-center gap-1 text-xs text-success mt-1">
                <BadgeCheck className="h-3.5 w-3.5" />
                Email verified
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs text-warning mt-1">
                Email not verified
              </span>
            )}
          </CardHeader>

          <CardContent className="space-y-3 text-sm">
            <p className="flex items-center gap-2 text-base-content/80">
              <Mail className="h-4 w-4 text-primary flex-shrink-0" />
              {user.email}
            </p>

            {user.staffNo && (
              <p className="flex items-center gap-2 text-base-content/80">
                <Hash className="h-4 w-4 text-primary flex-shrink-0" />
                Staff No: {user.staffNo}
              </p>
            )}

            <p className="flex items-center gap-2 text-base-content/60">
              <Calendar className="h-4 w-4 text-primary flex-shrink-0" />
              Joined {user.createdAt.toLocaleDateString("en-KE", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </CardContent>
        </Card>

        {/* Details & Actions */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-base-100 shadow-lg border border-base-200">
            <CardHeader>
              <CardTitle className="text-xl text-primary">Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-base-content/60 uppercase tracking-wide mb-1">
                    Full Name
                  </p>
                  <p className="font-medium">{user.name ?? "Not set"}</p>
                </div>

                <div>
                  <p className="text-xs text-base-content/60 uppercase tracking-wide mb-1">
                    Email Address
                  </p>
                  <p className="font-medium">{user.email}</p>
                </div>

                <div>
                  <p className="text-xs text-base-content/60 uppercase tracking-wide mb-1">
                    Role
                  </p>
                  <p className="font-medium capitalize">{user.role.toLowerCase()}</p>
                </div>

                <div>
                  <p className="text-xs text-base-content/60 uppercase tracking-wide mb-1">
                    Staff Number
                  </p>
                  <p className="font-medium">{user.staffNo ?? "Not assigned"}</p>
                </div>

                <div>
                  <p className="text-xs text-base-content/60 uppercase tracking-wide mb-1">
                    Email Verified
                  </p>
                  <p className="font-medium">
                    {user.emailVerified
                      ? user.emailVerified.toLocaleDateString("en-KE")
                      : "Not verified"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-base-content/60 uppercase tracking-wide mb-1">
                    Last Updated
                  </p>
                  <p className="font-medium">
                    {user.updatedAt.toLocaleDateString("en-KE")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Button
              asChild
              variant="outline"
              className="h-24 flex flex-col gap-2 border-neutral/40 hover:bg-base-200"
            >
              <Link href="/dashboard/settings/security">
                <Shield className="h-6 w-6 text-primary" />
                <span>Security Settings</span>
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="h-24 flex flex-col gap-2 border-neutral/40 hover:bg-base-200"
            >
              <Link href="/dashboard/profile/edit">
                <Edit className="h-6 w-6 text-primary" />
                <span>Edit Profile</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}