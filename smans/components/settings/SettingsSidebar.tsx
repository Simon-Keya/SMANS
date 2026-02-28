// app/dashboard/settings/components/SettingsSidebar.tsx
"use client";

import { cn } from "@/lib/utils";
import { LayoutDashboard, School, Settings, Shield, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  {
    href: "/dashboard/settings",
    label: "Overview",
    icon: LayoutDashboard,
  },
  {
    href: "/dashboard/settings/school",
    label: "School Info",
    icon: School,
  },
  {
    href: "/dashboard/settings/security",
    label: "Security",
    icon: Shield,
  },
  {
    href: "/dashboard/settings/roles",
    label: "Roles",
    icon: Users,
  },
  {
    href: "/dashboard/settings/permissions",
    label: "Permissions",
    icon: Shield,
  },
  {
    href: "/dashboard/settings/general",
    label: "General",
    icon: Settings,
  },
];

export default function SettingsSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full md:w-64 bg-card rounded-lg border shadow-sm">
      <nav className="p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}