// components/Sidebar.tsx (or layout/Sidebar.tsx)
"use client";

import { cn } from "@/lib/utils";
import {
  BarChart3,
  BellRing,
  BookOpen,
  CalendarCheck,
  CalendarDays,
  GraduationCap,
  Home,
  Settings,
  UserCircle,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
  role?: string; // "ADMIN" | "TEACHER" | "STUDENT" | "PARENT"
}

export default function Sidebar({ role = "STUDENT" }: SidebarProps) {
  const pathname = usePathname();

  // Role-based navigation items
  const navItems = {
    ADMIN: [
      { href: "/dashboard", label: "Dashboard", icon: Home },
      { href: "/dashboard/students", label: "Students", icon: Users },
      { href: "/dashboard/teachers", label: "Teachers", icon: GraduationCap },
      { href: "/dashboard/attendance/report", label: "Attendance", icon: CalendarCheck },
      { href: "/dashboard/grades", label: "Grades", icon: BarChart3 },
      { href: "/dashboard/timetable", label: "Timetable", icon: CalendarDays },
      { href: "/dashboard/settings", label: "Settings", icon: Settings },
      { href: "/dashboard/profile", label: "Profile", icon: UserCircle },
    ],
    TEACHER: [
      { href: "/dashboard", label: "Dashboard", icon: Home },
      { href: "/dashboard/classes", label: "My Classes", icon: BookOpen },
      { href: "/dashboard/attendance/mark", label: "Mark Attendance", icon: CalendarCheck },
      { href: "/dashboard/grades/enter", label: "Enter Grades", icon: BarChart3 },
      { href: "/dashboard/timetable", label: "My Timetable", icon: CalendarDays },
      { href: "/dashboard/profile", label: "Profile", icon: UserCircle },
    ],
    STUDENT: [
      { href: "/dashboard", label: "Dashboard", icon: Home },
      { href: "/dashboard/timetable", label: "My Timetable", icon: CalendarDays },
      { href: "/dashboard/grades", label: "My Grades", icon: BarChart3 },
      { href: "/dashboard/attendance", label: "Attendance", icon: CalendarCheck },
      { href: "/dashboard/announcements", label: "Announcements", icon: BellRing },
      { href: "/dashboard/profile", label: "Profile", icon: UserCircle },
    ],
    PARENT: [
      { href: "/dashboard", label: "Dashboard", icon: Home },
      { href: "/dashboard/children", label: "My Children", icon: Users },
      { href: "/dashboard/grades/child", label: "Grades", icon: BarChart3 },
      { href: "/dashboard/attendance/child", label: "Attendance", icon: CalendarCheck },
      { href: "/dashboard/announcements", label: "Announcements", icon: BellRing },
      { href: "/dashboard/profile", label: "Profile", icon: UserCircle },
    ],
  };

  const items = navItems[role as keyof typeof navItems] || navItems.STUDENT;

  return (
    <div className="hidden md:flex flex-col w-64 bg-base-200 border-r border-neutral">
      <nav className="flex-1 p-4">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-4 py-3 text-base-content/80 transition-all hover:bg-primary/10 hover:text-primary mb-1",
                isActive && "bg-primary/20 text-primary font-medium shadow-sm"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-neutral">
        {/* Optional bottom section */}
      </div>
    </div>
  );
}