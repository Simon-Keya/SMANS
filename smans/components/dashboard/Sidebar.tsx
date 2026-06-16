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
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Define types with all required permissions and roles
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

// Permission map for each role
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
  role?: Role;
  userPermissions?: Permission[];
}

interface NavItem {
  href: string;
  label: string;
  icon: any;
  permission?: Permission;
  roles?: Role[];
}

export default function Sidebar({ role = "STUDENT", userPermissions = [] }: SidebarProps) {
  const pathname = usePathname();

  const checkPermission = (permission?: Permission): boolean => {
    if (!permission) return true;
    if (userPermissions.length > 0) {
      return userPermissions.includes(permission) || userPermissions.includes("*");
    }
    return hasPermission(role, permission);
  };

  const allNavItems: NavItem[] = [
    // Dashboard (always visible)
    { href: "/dashboard", label: "Dashboard", icon: Home },

    // Students
    { 
      href: "/dashboard/students", 
      label: "Students", 
      icon: Users, 
      permission: "students:read",
      roles: ["ADMIN", "TEACHER", "ACCOUNTANT"]
    },

    // Teachers
    { 
      href: "/dashboard/teachers", 
      label: "Teachers", 
      icon: GraduationCap, 
      permission: "teachers:read",
      roles: ["ADMIN"]
    },

    // Classes
    { 
      href: "/dashboard/classes", 
      label: "My Classes", 
      icon: BookOpen, 
      permission: "classes:read",
      roles: ["TEACHER"]
    },
    { 
      href: "/dashboard/classes", 
      label: "Classes", 
      icon: BookOpen, 
      permission: "classes:read",
      roles: ["ADMIN"]
    },

    // Assessments
    { 
      href: "/dashboard/assessments", 
      label: "Assessments", 
      icon: BookOpen, 
      permission: "exams:read",
      roles: ["ADMIN", "TEACHER"]
    },

    // Attendance
    { 
      href: "/dashboard/attendance", 
      label: "Attendance", 
      icon: CalendarCheck, 
      permission: "attendance:read",
      roles: ["ADMIN", "STUDENT", "PARENT"]
    },
    { 
      href: "/dashboard/attendance/mark", 
      label: "Mark Attendance", 
      icon: CalendarCheck, 
      permission: "attendance:mark",
      roles: ["TEACHER"]
    },

    // Grades
    { 
      href: "/dashboard/grades", 
      label: "Grades", 
      icon: BarChart3, 
      permission: "grades:read",
      roles: ["ADMIN", "STUDENT", "PARENT"]
    },
    { 
      href: "/dashboard/grades/enter", 
      label: "Enter Grades", 
      icon: BarChart3, 
      permission: "grades:enter",
      roles: ["TEACHER"]
    },

    // Timetable
    { 
      href: "/dashboard/timetable", 
      label: "Timetable", 
      icon: CalendarDays, 
      permission: "exams:read",
      roles: ["ADMIN", "TEACHER", "STUDENT"]
    },

    // Fees
    { 
      href: "/dashboard/fees", 
      label: "Fees & Finance", 
      icon: DollarSign, 
      permission: "fees:read",
      roles: ["ADMIN", "ACCOUNTANT", "PARENT"]
    },

    // Children (Parent specific)
    { 
      href: "/dashboard/children", 
      label: "My Children", 
      icon: Users, 
      permission: "students:read",
      roles: ["PARENT"]
    },

    // Settings (Admin only)
    { 
      href: "/dashboard/settings", 
      label: "Settings", 
      icon: Settings, 
      permission: "settings:*",
      roles: ["ADMIN"]
    },

    // Profile (everyone)
    { 
      href: "/dashboard/profile", 
      label: "Profile", 
      icon: UserCircle, 
      permission: "profile:read",
    },
  ];

  // Filter nav items based on role and permissions
  const filteredNavItems = allNavItems.filter((item) => {
    // Check role-based access first
    if (item.roles && !item.roles.includes(role)) return false;

    // Check permission-based access
    if (item.permission) {
      return checkPermission(item.permission);
    }

    return true;
  });

  // Remove duplicates based on href (keep first occurrence)
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
    <div className="hidden md:flex flex-col w-64 bg-base-200 border-r border-neutral h-screen">
      <div className="p-6 border-b border-neutral">
        <h2 className="font-bold text-xl text-primary">SMANS</h2>
        <p className="text-xs text-base-content/60 mt-1">Kenya CBC System</p>
        <div className="mt-2 text-xs text-primary/60 font-medium">
          {role}
        </div>
      </div>

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

      <div className="p-4 border-t border-neutral text-xs text-base-content/50">
        <p>© {new Date().getFullYear()} SMANS • CBC Kenya</p>
        <p className="mt-1">v1.0.0</p>
      </div>
    </div>
  );
}