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
  PlusCircle,
  List,
  Eye,
  PenSquare,
  Receipt,
  PieChart,
  UserPlus,
  BookMarked,
  FileCheck,
  Calendar,
  AlertCircle,
  MessageSquare,
  TrendingUp,
  User,
  Mail,
  Phone,
  Briefcase,
  Heart,
  Activity,
  Shield,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState, useEffect } from "react";

// Define types locally as fallback (these match the ones in lib/permissions.ts)
type Role = "ADMIN" | "TEACHER" | "STUDENT" | "PARENT" | "ACCOUNTANT";
type Permission = 
  | "*"
  | "users:*"
  | "students:*"
  | "teachers:*"
  | "parents:*"
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
  | "parents:read"
  | "parents:write"
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
  | "fees:write"
  | "profile:read"
  | "profile:write";

// Permission map (matches the one in lib/permissions.ts)
const permissions: Record<Role, Permission[]> = {
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
    "fees:write",
    "reports:read",
    "reports:generate",
    "profile:read",
    "profile:write",
    "students:read",
  ],
};

// Permission check function (matches the one in lib/permissions.ts)
function hasPermission(role: Role, permission: Permission): boolean {
  if (role === "ADMIN") return true;

  const perms = permissions[role];
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
  children?: NavItem[];
  badge?: number;
}

export default function Sidebar({ role = "STUDENT" }: SidebarProps) {
  const pathname = usePathname();
  const userRole = role.toUpperCase() as Role;
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread notification count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await fetch("/api/notifications/unread-count");
        if (response.ok) {
          const data = await response.json();
          setUnreadCount(data.count || 0);
        }
      } catch (error) {
        console.error("Failed to fetch unread count:", error);
      }
    };
    fetchUnreadCount();
  }, []);

  const checkPermission = (permission?: Permission): boolean => {
    if (!permission) return true;
    return hasPermission(userRole, permission);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await signOut({ callbackUrl: "/auth/login" });
  };

  const toggleSection = (label: string) => {
    setExpandedSections(prev =>
      prev.includes(label)
        ? prev.filter(item => item !== label)
        : [...prev, label]
    );
  };

  const isSectionExpanded = (label: string) => expandedSections.includes(label);
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  const navItems: NavItem[] = [
    { 
      href: "/dashboard", 
      label: "Dashboard", 
      icon: Home,
    },
    {
      href: "#",
      label: "Students",
      icon: Users,
      roles: ["ADMIN", "TEACHER", "ACCOUNTANT"],
      children: [
        { 
          href: "/dashboard/students", 
          label: "All Students", 
          icon: List,
          permission: "students:read",
        },
        { 
          href: "/dashboard/students/new", 
          label: "Add Student", 
          icon: UserPlus,
          permission: "students:write",
          roles: ["ADMIN"],
        },
      ],
    },
    {
      href: "#",
      label: "Teachers",
      icon: GraduationCap,
      roles: ["ADMIN"],
      children: [
        { 
          href: "/dashboard/teachers", 
          label: "All Teachers", 
          icon: List,
          permission: "teachers:read",
        },
        { 
          href: "/dashboard/teachers/new", 
          label: "Add Teacher", 
          icon: UserPlus,
          permission: "teachers:write",
        },
      ],
    },
    // ✅ ADDED: Parents Module
    {
      href: "#",
      label: "Parents",
      icon: Users,
      roles: ["ADMIN"],
      children: [
        { 
          href: "/dashboard/parents", 
          label: "All Parents", 
          icon: List,
          permission: "parents:read",
        },
        { 
          href: "/dashboard/parents/new", 
          label: "Add Parent", 
          icon: UserPlus,
          permission: "parents:write",
        },
      ],
    },
    {
      href: "#",
      label: "Academics",
      icon: BookOpen,
      roles: ["ADMIN", "TEACHER"],
      children: [
        { 
          href: "/dashboard/classes", 
          label: "Classes", 
          icon: School,
          permission: "classes:read",
        },
        { 
          href: "/dashboard/subjects", 
          label: "Subjects", 
          icon: BookMarked,
          permission: "classes:read",
          roles: ["ADMIN"],
        },
        { 
          href: "/dashboard/timetable", 
          label: "Timetable", 
          icon: Calendar,
          permission: "classes:read",
        },
      ],
    },
    {
      href: "#",
      label: "Assignments",
      icon: ClipboardList,
      roles: ["ADMIN", "TEACHER", "STUDENT"],
      children: [
        { 
          href: "/dashboard/assignments", 
          label: "All Assignments", 
          icon: List,
          permission: "exams:read",
        },
        { 
          href: "/dashboard/assignments/create", 
          label: "Create Assignment", 
          icon: PlusCircle,
          permission: "exams:create",
          roles: ["ADMIN", "TEACHER"],
        },
      ],
    },
    {
      href: "#",
      label: "Assessments",
      icon: FileText,
      roles: ["ADMIN", "TEACHER"],
      children: [
        { 
          href: "/dashboard/assessments", 
          label: "All Assessments", 
          icon: List,
          permission: "exams:read",
        },
        { 
          href: "/dashboard/assessments/create", 
          label: "Create Assessment", 
          icon: PlusCircle,
          permission: "exams:create",
        },
      ],
    },
    {
      href: "#",
      label: "Exams",
      icon: BarChart3,
      roles: ["ADMIN", "TEACHER", "STUDENT"],
      children: [
        { 
          href: "/dashboard/exams", 
          label: "All Exams", 
          icon: List,
          permission: "exams:read",
        },
        { 
          href: "/dashboard/exams/create", 
          label: "Create Exam", 
          icon: PlusCircle,
          permission: "exams:create",
          roles: ["ADMIN", "TEACHER"],
        },
      ],
    },
    {
      href: "#",
      label: "Attendance",
      icon: CalendarCheck,
      roles: ["ADMIN", "TEACHER", "STUDENT", "PARENT"],
      children: [
        { 
          href: "/dashboard/attendance", 
          label: "View Attendance", 
          icon: Eye,
          permission: "attendance:read",
        },
        { 
          href: "/dashboard/attendance/mark", 
          label: "Mark Attendance", 
          icon: PenSquare,
          permission: "attendance:mark",
          roles: ["TEACHER"],
        },
      ],
    },
    {
      href: "#",
      label: "Grades",
      icon: Award,
      roles: ["ADMIN", "TEACHER", "STUDENT", "PARENT"],
      children: [
        { 
          href: "/dashboard/grades", 
          label: "View Grades", 
          icon: Eye,
          permission: "grades:read",
        },
        { 
          href: "/dashboard/grades/enter", 
          label: "Enter Grades", 
          icon: PenSquare,
          permission: "grades:enter",
          roles: ["TEACHER"],
        },
        { 
          href: "/dashboard/grades/publish", 
          label: "Publish Grades", 
          icon: FileCheck,
          permission: "grades:publish",
          roles: ["TEACHER"],
        },
      ],
    },
    {
      href: "#",
      label: "Fees & Finance",
      icon: DollarSign,
      roles: ["ADMIN", "ACCOUNTANT", "PARENT"],
      children: [
        { 
          href: "/dashboard/fees", 
          label: "Fee Management", 
          icon: CreditCard,
          permission: "fees:read",
        },
        { 
          href: "/dashboard/fees/structure", 
          label: "Fee Structure", 
          icon: List,
          permission: "fees:read",
          roles: ["ADMIN", "ACCOUNTANT"],
        },
        { 
          href: "/dashboard/fees/structure/new", 
          label: "Add Fee Item", 
          icon: PlusCircle,
          permission: "fees:write",
          roles: ["ADMIN", "ACCOUNTANT"],
        },
        { 
          href: "/dashboard/invoices", 
          label: "Invoices", 
          icon: Receipt,
          permission: "fees:read",
          roles: ["ADMIN", "ACCOUNTANT"],
        },
        { 
          href: "/dashboard/invoices/new", 
          label: "Create Invoice", 
          icon: FileCheck,
          permission: "fees:write",
          roles: ["ADMIN", "ACCOUNTANT"],
        },
        { 
          href: "/dashboard/payments", 
          label: "Payments", 
          icon: CreditCard,
          permission: "fees:read",
          roles: ["ADMIN", "ACCOUNTANT"],
        },
        { 
          href: "/dashboard/reports/financial", 
          label: "Financial Reports", 
          icon: TrendingUp,
          permission: "reports:read",
          roles: ["ADMIN", "ACCOUNTANT"],
        },
      ],
    },
    {
      href: "#",
      label: "Children",
      icon: Users,
      roles: ["PARENT"],
      children: [
        { 
          href: "/dashboard/children", 
          label: "My Children", 
          icon: Users,
          permission: "students:read",
        },
      ],
    },
    { 
      href: "/dashboard/notifications", 
      label: "Notifications", 
      icon: Bell, 
      permission: "notifications:read",
      badge: unreadCount,
    },
    {
      href: "#",
      label: "Reports",
      icon: PieChart,
      roles: ["ADMIN", "TEACHER", "ACCOUNTANT"],
      children: [
        { 
          href: "/dashboard/reports", 
          label: "All Reports", 
          icon: List,
          permission: "reports:read",
        },
        { 
          href: "/dashboard/reports/academic", 
          label: "Academic Reports", 
          icon: Award,
          permission: "reports:read",
          roles: ["ADMIN", "TEACHER"],
        },
        { 
          href: "/dashboard/reports/financial", 
          label: "Financial Reports", 
          icon: TrendingUp,
          permission: "reports:read",
          roles: ["ADMIN", "ACCOUNTANT"],
        },
      ],
    },
    { 
      href: "/dashboard/settings", 
      label: "Settings", 
      icon: Settings, 
      permission: "settings:*",
      roles: ["ADMIN"],
    },
    { 
      href: "/dashboard/profile", 
      label: "Profile", 
      icon: UserCircle, 
      permission: "profile:read",
    },
  ];

  const filterNavItems = (items: NavItem[]): NavItem[] => {
    const filtered: NavItem[] = [];
    
    for (const item of items) {
      if (item.roles && !item.roles.includes(userRole)) continue;
      if (item.permission && !checkPermission(item.permission)) continue;
      
      if (item.children) {
        const filteredChildren = filterNavItems(item.children);
        if (filteredChildren.length === 0) continue;
        
        filtered.push({
          ...item,
          children: filteredChildren,
        });
      } else {
        filtered.push(item);
      }
    }
    
    return filtered;
  };

  const filteredNavItems = filterNavItems(navItems);

  const renderNavItem = (item: NavItem, depth: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isItemActive = isActive(item.href);
    const isExpanded = isSectionExpanded(item.label);

    if (hasChildren) {
      return (
        <div key={item.label} className="mb-1">
          <button
            onClick={() => toggleSection(item.label)}
            className={cn(
              "flex items-center gap-3 rounded-lg px-4 py-3 w-full text-base-content/80 transition-all hover:bg-primary/10 hover:text-primary",
              isItemActive && "bg-primary/20 text-primary font-medium"
            )}
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            <span className="flex-1 text-left truncate">{item.label}</span>
            {item.badge !== undefined && item.badge > 0 && (
              <span className="badge badge-error badge-sm">{item.badge}</span>
            )}
            <ChevronDown 
              className={cn(
                "h-4 w-4 transition-transform",
                isExpanded && "transform rotate-180"
              )}
            />
          </button>
          {isExpanded && (
            <div className="ml-4 pl-2 border-l-2 border-base-300">
              {item.children?.map(child => renderNavItem(child, depth + 1))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          "flex items-center gap-3 rounded-lg px-4 py-3 text-base-content/80 transition-all hover:bg-primary/10 hover:text-primary mb-1",
          isItemActive && "bg-primary/20 text-primary font-medium shadow-sm",
          depth > 0 && "ml-2"
        )}
      >
        <item.icon className="h-5 w-5 flex-shrink-0" />
        <span className="truncate">{item.label}</span>
        {item.badge !== undefined && item.badge > 0 && (
          <span className="badge badge-error badge-sm ml-auto">{item.badge}</span>
        )}
      </Link>
    );
  };

  return (
    <div className="hidden md:flex flex-col w-64 bg-base-200 border-r border-neutral h-screen sticky top-0">
      <div className="p-6 border-b border-neutral">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <School className="h-5 w-5 text-primary-content" />
          </div>
          <div>
            <h2 className="font-bold text-xl text-primary">SMANS</h2>
            <p className="text-xs text-base-content/60">Kenya CBC System</p>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-primary/60 font-medium flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-success" />
            {userRole}
          </span>
          <span className="text-xs bg-success/10 text-success px-2 py-0.5 rounded-full flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-success animate-pulse" />
            Online
          </span>
        </div>
      </div>

      <nav className="flex-1 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-base-300 scrollbar-track-transparent">
        {filteredNavItems.map(item => renderNavItem(item))}
      </nav>

      <div className="p-4 border-t border-neutral space-y-2 bg-base-200/50">
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
          <p className="mt-0.5">v2.0.0</p>
        </div>
      </div>
    </div>
  );
}