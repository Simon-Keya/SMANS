// components/Sidebar.tsx
"use client";

import { cn } from "@/lib/utils";
import {
  BarChart3,
  BellRing,
  BookOpen,
  CalendarCheck,
  CalendarDays,
  DollarSign,
  GraduationCap,
  Home,
  Settings,
  UserCircle,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
  role?: string;
}

export default function Sidebar({ role = "STUDENT" }: SidebarProps) {
  const pathname = usePathname();

  const navItems = {
    ADMIN: [
      { href: "/dashboard", label: "Dashboard", icon: Home },
      { href: "/dashboard/students", label: "Students", icon: Users },
      { href: "/dashboard/teachers", label: "Teachers", icon: GraduationCap },
      { href: "/dashboard/assessments", label: "Assessments", icon: BookOpen },
      { href: "/dashboard/attendance", label: "Attendance", icon: CalendarCheck },
      { href: "/dashboard/grades", label: "Grades", icon: BarChart3 },
      { href: "/dashboard/timetable", label: "Timetable", icon: CalendarDays },
      { href: "/dashboard/fees", label: "Fees & Finance", icon: DollarSign },
      { href: "/dashboard/settings", label: "Settings", icon: Settings },
      { href: "/dashboard/profile", label: "Profile", icon: UserCircle },
    ],

    TEACHER: [
      { href: "/dashboard", label: "Dashboard", icon: Home },
      { href: "/dashboard/classes", label: "My Classes", icon: BookOpen },
      { href: "/dashboard/assessments", label: "Assessments", icon: BookOpen },
      { href: "/dashboard/attendance/mark", label: "Mark Attendance", icon: CalendarCheck },
      { href: "/dashboard/grades/enter", label: "Enter Grades", icon: BarChart3 },
      { href: "/dashboard/timetable", label: "My Timetable", icon: CalendarDays },
      { href: "/dashboard/profile", label: "Profile", icon: UserCircle },
    ],

    ACCOUNTANT: [
      { href: "/dashboard", label: "Dashboard", icon: Home },
      { href: "/dashboard/assessments", label: "Assessments", icon: BookOpen },
      { href: "/dashboard/fees", label: "Fees & Finance", icon: DollarSign },
      { href: "/dashboard/accountant", label: "Accountant Dashboard", icon: BarChart3 },
      { href: "/dashboard/profile", label: "Profile", icon: UserCircle },
    ],

    STUDENT: [
      { href: "/dashboard", label: "Dashboard", icon: Home },
      { href: "/dashboard/timetable", label: "My Timetable", icon: CalendarDays },
      { href: "/dashboard/assessments", label: "My Assessments", icon: BookOpen },
      { href: "/dashboard/grades", label: "My Grades", icon: BarChart3 },
      { href: "/dashboard/attendance", label: "Attendance", icon: CalendarCheck },
      { href: "/dashboard/announcements", label: "Announcements", icon: BellRing },
      { href: "/dashboard/profile", label: "Profile", icon: UserCircle },
    ],

    PARENT: [                                   // ← Updated for Parent
      { href: "/dashboard", label: "Dashboard", icon: Home },
      { href: "/dashboard/children", label: "My Children", icon: Users },
      { href: "/dashboard/assessments/child", label: "Assessments", icon: BookOpen },
      { href: "/dashboard/grades/child", label: "Grades & Progress", icon: BarChart3 },
      { href: "/dashboard/attendance/child", label: "Attendance", icon: CalendarCheck },
      { href: "/dashboard/fees/child", label: "Fees & Payments", icon: DollarSign },
      { href: "/dashboard/announcements", label: "Announcements", icon: BellRing },
      { href: "/dashboard/profile", label: "Profile", icon: UserCircle },
    ],
  };

  const items = navItems[role as keyof typeof navItems] || navItems.STUDENT;

  return (
    <div className="hidden md:flex flex-col w-64 bg-base-200 border-r border-neutral h-screen">
      <div className="p-6 border-b border-neutral">
        <h2 className="font-bold text-xl text-primary">SMANS</h2>
        <p className="text-xs text-base-content/60 mt-1">Kenya CBC System</p>
      </div>

      <nav className="flex-1 p-4 overflow-y-auto">
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

      <div className="p-4 border-t border-neutral text-xs text-base-content/50">
        © {new Date().getFullYear()} SMANS • CBC Kenya
      </div>
    </div>
  );
}