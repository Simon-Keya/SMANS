"use client";

import { cn } from "@/lib/utils";
import {
  BarChart3,
  BookOpen,
  CalendarCheck,
  CalendarDays,
  GraduationCap,
  Home,
  Settings,
  UserCircle,
  Users,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = (session?.user?.role as string)?.toLowerCase() || "student";

  // Role-based navigation items
  const navItems = {
    admin: [
      { href: "/dashboard", label: "Dashboard", icon: Home },
      { href: "/dashboard/students", label: "Students", icon: Users },
      { href: "/dashboard/teachers", label: "Teachers", icon: GraduationCap },
      { href: "/dashboard/attendance/report", label: "Attendance", icon: CalendarCheck },
      { href: "/dashboard/grades", label: "Grades", icon: BarChart3 },
      { href: "/dashboard/timetable", label: "Timetable", icon: CalendarDays },
      { href: "/dashboard/settings", label: "Settings", icon: Settings },
      { href: "/dashboard/profile", label: "Profile", icon: UserCircle },
    ],
    teacher: [
      { href: "/dashboard", label: "Dashboard", icon: Home },
      { href: "/dashboard/classes", label: "My Classes", icon: BookOpen },
      { href: "/dashboard/attendance/mark", label: "Mark Attendance", icon: CalendarCheck },
      { href: "/dashboard/grades/enter", label: "Enter Grades", icon: BarChart3 },
      { href: "/dashboard/timetable", label: "My Timetable", icon: CalendarDays },
      { href: "/dashboard/profile", label: "Profile", icon: UserCircle },
    ],
    student: [
      { href: "/dashboard", label: "Dashboard", icon: Home },
      { href: "/dashboard/timetable", label: "My Timetable", icon: CalendarDays },
      { href: "/dashboard/grades", label: "My Grades", icon: BarChart3 },
      { href: "/dashboard/attendance", label: "Attendance", icon: CalendarCheck },
      { href: "/dashboard/announcements", label: "Announcements", icon: BellRing },
      { href: "/dashboard/profile", label: "Profile", icon: UserCircle },
    ],
    parent: [
      { href: "/dashboard", label: "Dashboard", icon: Home },
      { href: "/dashboard/children", label: "My Children", icon: Users },
      { href: "/dashboard/grades/child", label: "Grades", icon: BarChart3 },
      { href: "/dashboard/attendance/child", label: "Attendance", icon: CalendarCheck },
      { href: "/dashboard/announcements", label: "Announcements", icon: BellRing },
      { href: "/dashboard/profile", label: "Profile", icon: UserCircle },
    ],
  };

  const items = navItems[role as keyof typeof navItems] || navItems.student;

  return (
    <div className="hidden md:flex flex-col w-64 bg-base-200 border-r">
      <div className="p-6 border-b">
        <h2 className="text-2xl font-bold tracking-tight text-primary">SMANS</h2>
        <p className="text-sm text-base-content/60 mt-1">School Management System</p>
      </div>
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
      <div className="p-4 border-t">
        <p className="text-xs text-base-content/50 text-center">
          © {new Date().getFullYear()} SMANS
        </p>
      </div>
    </div>
  );
}