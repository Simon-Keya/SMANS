// app/dashboard/settings/page.tsx
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { authOptions } from "@/lib/auth/auth"; // ← FIXED: correct import
import { School, Settings2, Shield, Users } from "lucide-react";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-primary">School Settings</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <CardLink
          href="/dashboard/settings/school"
          icon={<School className="h-8 w-8 text-primary" />}
          title="School Info"
          description="Update name, logo, address, contact"
        />
        <CardLink
          href="/dashboard/settings/roles"
          icon={<Users className="h-8 w-8 text-primary" />}
          title="Roles & Permissions"
          description="Manage user roles and access levels"
        />
        <CardLink
          href="/dashboard/settings/permissions"
          icon={<Shield className="h-8 w-8 text-primary" />}
          title="Permissions"
          description="Fine-tune access controls"
        />
        <CardLink
          href="/dashboard/settings/general"
          icon={<Settings2 className="h-8 w-8 text-primary" />}
          title="General Settings"
          description="Notifications, appearance, language"
        />
      </div>
    </div>
  );
}

function CardLink({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link href={href}>
      <Card className="h-full hover:shadow-xl transition-all border border-base-200 bg-base-100">
        <CardHeader className="flex flex-row items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
            {icon}
          </div>
          <div>
            <CardTitle className="text-xl text-primary">{title}</CardTitle>
            <p className="text-sm text-base-content/70">{description}</p>
          </div>
        </CardHeader>
      </Card>
    </Link>
  );
}