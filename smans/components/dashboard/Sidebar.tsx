// components/dashboard/Sidebar.tsx
"use client";

import { cn } from "@/lib/utils";
import {
  BarChart3,
  BookOpen,
  CalendarCheck,
  CalendarDays,
  DollarSign,
  GraduationCap,
  Home,
  Settings,
  UserCircle,
  Users,
  LogOut,
  FileText,
  Bell,
  CreditCard,
  School,
  ClipboardList,
  Award,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";

type Role = "ADMIN" | "TEACHER" | "STUDENT" | "PARENT" | "ACCOUNTANT";

type Permission = 
  | "*"
  | "users:*"
  | "students:*"
  | "teachers:*"
  | "classes:*"
  | "attendance:*"
  | "grades:*"
  | "exams:*"
  | "reports:*"
  | "notifications:*"
  | "fees:*"
  | "settings:*"
  | "users:read"
  | "users:write"
  | "students:read"
  | "students:write"
  | "teachers:read"
  | "teachers:write"
  | "classes:read"
  | "classes:write"
  | "attendance:mark"
  | "attendance:read"
  | "attendance:edit"
  | "grades:enter"
  | "grades:read"
  | "grades:publish"
  | "exams:create"
  | "exams:read"
  | "reports:generate"
  | "reports:read"
  | "notifications:send"
  | "notifications:read"
  | "fees:read"
  | "fees:pay"
  | "profile:read"
  | "profile:write";

const rolePermissions: Record<Role, Permission[]> = {
  ADMIN: ["*"],
  TEACHER: [
    "students:read",
    "students:write",
    "attendance:mark",
    "attendance:read",
    "attendance:edit",
    "grades:enter",
    "grades:read",
    "grades:publish",
    "exams:create",
    "exams:read",
    "reports:generate",
    "reports:read",
    "notifications:read",
    "notifications:send",
    "profile:read",
    "profile:write",
    "classes:read",
    "classes:write",
  ],
  STUDENT: [
    "grades:read",
    "attendance:read",
    "profile:read",
    "profile:write",
    "notifications:read",
    "exams:read",
  ],
  PARENT: [
    "students:read",
    "grades:read",
    "attendance:read",
    "fees:read",
    "profile:read",
    "profile:write",
    "notifications:read",
  ],
  ACCOUNTANT: [
    "fees:read",
    "fees:pay",
    "reports:read",
    "reports:generate",
    "profile:read",
    "profile:write",
    "students:read",
  ],
};

function hasPermission(role: Role, permission: Permission): boolean {
  if (role === "ADMIN") return true;
  
  const perms = rolePermissions[role];
  if (!perms) return false;
  
  if (perms.includes(permission)) return true;
  
  const parts = permission.split(":");
  if (parts.length === 2) {
    const resource = parts[0];
    if (perms.includes(`${resource}:*` as Permission)) return true;
  }
  
  if (perms.includes("*")) return true;
  
  return false;
}

interface SidebarProps {
  role?: string;
}

interface NavItem {
  href: string;
  label: string;
  icon: any;
  roles?: Role[];
  permission?: Permission;
}

export default function Sidebar({ role = "STUDENT" }: SidebarProps) {
  const pathname = usePathname();
  const userRole = role.toUpperCase() as Role;
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const checkPermission = (permission?: Permission): boolean => {
    if (!permission) return true;
    return hasPermission(userRole, permission);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await signOut({ callbackUrl: "/auth/login" });
  };

  // Define navigation items with role-based visibility
  const allNavItems: NavItem[] = [
    { href: "/dashboard", label: "Dashboard", icon: Home },

    { 
      href: "/dashboard/students", 
      label: "Students", 
      icon: Users, 
      permission: "students:read",
      roles: ["ADMIN", "TEACHER", "ACCOUNTANT"]
    },

    { 
      href: "/dashboard/teachers", 
      label: "Teachers", 
      icon: GraduationCap, 
      permission: "teachers:read",
      roles: ["ADMIN"]
    },

    { 
      href: "/dashboard/classes", 
      label: "Classes", 
      icon: School, 
      permission: "classes:read",
      roles: ["ADMIN", "TEACHER"]
    },

    { 
      href: "/dashboard/assignments", 
      label: "Assignments", 
      icon: ClipboardList, 
      permission: "exams:read",
      roles: ["ADMIN", "TEACHER", "STUDENT"]
    },

    { 
      href: "/dashboard/assessments", 
      label: "Assessments", 
      icon: FileText, 
      permission: "exams:read",
      roles: ["ADMIN", "TEACHER"]
    },

    { 
      href: "/dashboard/attendance", 
      label: "Attendance", 
      icon: CalendarCheck, 
      permission: "attendance:read",
      roles: ["ADMIN", "STUDENT", "PARENT", "TEACHER"]
    },
    { 
      href: "/dashboard/attendance/mark", 
      label: "Mark Attendance", 
      icon: Clock, 
      permission: "attendance:mark",
      roles: ["TEACHER"]
    },

    { 
      href: "/dashboard/grades", 
      label: "Grades", 
      icon: BarChart3, 
      permission: "grades:read",
      roles: ["ADMIN", "STUDENT", "PARENT", "TEACHER"]
    },
    { 
      href: "/dashboard/grades/enter", 
      label: "Enter Grades", 
      icon: Award, 
      permission: "grades:enter",
      roles: ["TEACHER"]
    },

    { 
      href: "/dashboard/timetable", 
      label: "Timetable", 
      icon: CalendarDays, 
      permission: "exams:read",
      roles: ["ADMIN", "TEACHER", "STUDENT", "PARENT"]
    },

    { 
      href: "/dashboard/fees", 
      label: "Fees & Finance", 
      icon: CreditCard, 
      permission: "fees:read",
      roles: ["ADMIN", "ACCOUNTANT", "PARENT"]
    },

    { 
      href: "/dashboard/children", 
      label: "My Children", 
      icon: Users, 
      permission: "students:read",
      roles: ["PARENT"]
    },

    { 
      href: "/dashboard/notifications", 
      label: "Notifications", 
      icon: Bell, 
      permission: "notifications:read",
      roles: ["ADMIN", "TEACHER", "STUDENT", "PARENT", "ACCOUNTANT"]
    },

    { 
      href: "/dashboard/settings", 
      label: "Settings", 
      icon: Settings, 
      permission: "settings:*",
      roles: ["ADMIN"]
    },

    { 
      href: "/dashboard/profile", 
      label: "Profile", 
      icon: UserCircle, 
      permission: "profile:read",
    },
  ];

  // Filter navigation items based on role and permissions
  const filteredNavItems = allNavItems.filter((item) => {
    if (item.roles && !item.roles.includes(userRole)) return false;
    if (item.permission) {
      return checkPermission(item.permission);
    }
    return true;
  });

  // Remove duplicate hrefs (keep first occurrence)
  const uniqueNavItems = filteredNavItems.filter(
    (item, index, self) => self.findIndex((i) => i.href === item.href) === index
  );

  // Sort items: Dashboard first, then alphabetically
  const sortedNavItems = uniqueNavItems.sort((a, b) => {
    if (a.href === "/dashboard") return -1;
    if (b.href === "/dashboard") return 1;
    return a.label.localeCompare(b.label);
  });

  return (
    <div className="hidden md:flex flex-col w-64 bg-base-200 border-r border-neutral h-screen sticky top-0">
      {/* Header */}
      <div className="p-6 border-b border-neutral">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <School className="h-5 w-5 text-primary-content" />
          </div>
          <div>
            <h2 className="font-bold text-xl text-primary">SMANS</h2>
            <p className="text-xs text-base-content/60">Kenya CBC System</p>
          </div>
        </div>
        <div className="mt-2 text-xs text-primary/60 font-medium">
          {userRole}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        {sortedNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-4 py-3 text-base-content/80 transition-all hover:bg-primary/10 hover:text-primary mb-1",
                isActive && "bg-primary/20 text-primary font-medium shadow-sm"
              )}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer with Logout */}
      <div className="p-4 border-t border-neutral space-y-2">
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className={cn(
            "flex items-center gap-3 rounded-lg px-4 py-3 text-base-content/80 transition-all hover:bg-error/10 hover:text-error w-full",
            isLoggingOut && "opacity-50 cursor-not-allowed"
          )}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          <span className="truncate">{isLoggingOut ? "Logging out..." : "Logout"}</span>
        </button>
        <div className="text-xs text-base-content/50 text-center pt-2">
          <p>© {new Date().getFullYear()} SMANS</p>
          <p className="mt-0.5">v1.0.0</p>
        </div>
      </div>
    </div>
  );
}