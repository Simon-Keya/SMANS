// app/dashboard/settings/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { authOptions } from "@/lib/auth/auth";
import { School, Settings2, Shield, Users, Bell, Palette, Database, Key } from "lucide-react";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const settingsCards = [
    {
      href: "/dashboard/settings/school",
      icon: School,
      title: "School Info",
      description: "Update school name, logo, address, and contact details",
      color: "text-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      href: "/dashboard/settings/roles",
      icon: Users,
      title: "Roles & Permissions",
      description: "Manage user roles and access levels",
      color: "text-purple-500",
      bgColor: "bg-purple-50",
    },
    {
      href: "/dashboard/settings/permissions",
      icon: Shield,
      title: "Permissions",
      description: "Fine-tune access controls for each role",
      color: "text-red-500",
      bgColor: "bg-red-50",
    },
    {
      href: "/dashboard/settings/general",
      icon: Settings2,
      title: "General Settings",
      description: "Notifications, appearance, language, and timezone",
      color: "text-gray-500",
      bgColor: "bg-gray-50",
    },
    {
      href: "/dashboard/settings/notifications",
      icon: Bell,
      title: "Notifications",
      description: "Configure email and SMS notification preferences",
      color: "text-yellow-500",
      bgColor: "bg-yellow-50",
    },
    {
      href: "/dashboard/settings/appearance",
      icon: Palette,
      title: "Appearance",
      description: "Customize theme, colors, and branding",
      color: "text-pink-500",
      bgColor: "bg-pink-50",
    },
    {
      href: "/dashboard/settings/backup",
      icon: Database,
      title: "Backup & Restore",
      description: "Manage database backups and data export",
      color: "text-green-500",
      bgColor: "bg-green-50",
    },
    {
      href: "/dashboard/settings/security",
      icon: Key,
      title: "Security",
      description: "Password policies, 2FA, and session management",
      color: "text-orange-500",
      bgColor: "bg-orange-50",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-primary">Settings</h1>
          <p className="text-base-content/60 mt-1">
            Manage your school configuration and preferences
          </p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 bg-base-200 rounded-full text-sm">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-base-content/70">All systems operational</span>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {settingsCards.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className="group">
              <Card className="h-full hover:shadow-xl transition-all duration-300 border border-base-200 bg-base-100 hover:border-primary/20 hover:scale-[1.02]">
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl ${item.bgColor} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={`h-6 w-6 ${item.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base font-semibold text-base-content truncate">
                        {item.title}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-base-content/60 leading-relaxed line-clamp-2">
                    {item.description}
                  </p>
                  <div className="mt-3 flex items-center text-xs text-primary/60 group-hover:text-primary transition-colors">
                    <span>Configure</span>
                    <svg className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Settings2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-base-content">Need help?</p>
              <p className="text-sm text-base-content/60">Check the documentation or contact support</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link href="/dashboard/settings/help" className="btn btn-outline btn-sm">
              Documentation
            </Link>
            <Link href="/dashboard/settings/contact" className="btn btn-primary btn-sm">
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}