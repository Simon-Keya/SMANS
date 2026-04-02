// app/dashboard/page.tsx
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import {
  ArrowRight,
  BarChart3,
  BellRing,
  BookOpen,
  CalendarCheck,
  CalendarDays, // ← Added this import
  DollarSign,
  GraduationCap,
  ShieldCheck,
  TrendingUp,
  Users,
} from "lucide-react";
import { redirect } from "next/navigation";

type Role = "ADMIN" | "TEACHER" | "STUDENT" | "PARENT" | "ACCOUNTANT";

export default async function DashboardHome() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  const userRole = user.role as Role;
  const userName = user.name ?? "User";

  // Fetch common stats
  let totalStudents = 0;
  let totalTeachers = 0;
  let attendanceRate = 0;

  try {
    totalStudents = await prisma.student.count();
    totalTeachers = await prisma.user.count({ where: { role: "TEACHER" } });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const presentToday = await prisma.attendance.count({
      where: {
        date: { gte: today, lt: tomorrow },
        status: "PRESENT",
      },
    });

    const totalAttendanceToday = await prisma.attendance.count({
      where: { date: { gte: today, lt: tomorrow } },
    });

    attendanceRate = totalAttendanceToday > 0
      ? Math.round((presentToday / totalAttendanceToday) * 100)
      : 0;
  } catch (error) {
    console.error("Dashboard stats error:", error);
  }

  const roleData: Record<Role, {
    greeting: string;
    subtitle: string;
    badge: string;
    badgeIcon: any;
    stats: any[];
    quickLinks: { label: string; href: string; icon: any }[];
  }> = {
    ADMIN: {
      greeting: "Welcome back",
      subtitle: "Here's a full overview of your school today.",
      badge: "Administrator",
      badgeIcon: ShieldCheck,
      stats: [
        { label: "Total Students", value: totalStudents, icon: Users, accent: "primary", trend: "+12 this month" },
        { label: "Active Teachers", value: totalTeachers, icon: GraduationCap, accent: "primary", trend: "All active" },
        { label: "Today's Attendance", value: `${attendanceRate}%`, icon: CalendarCheck, accent: "primary", trend: "vs yesterday" },
        { label: "System Alerts", value: "3", icon: BellRing, accent: "error", trend: "Needs attention" },
      ],
      quickLinks: [
        { label: "Manage Students", href: "/dashboard/students", icon: Users },
        { label: "View Reports", href: "/dashboard/reports", icon: BarChart3 },
        { label: "Fees & Finance", href: "/dashboard/fees", icon: DollarSign },
      ],
    },

    TEACHER: {
      greeting: "Good to see you",
      subtitle: "Here's what's on your plate today.",
      badge: "Teacher",
      badgeIcon: GraduationCap,
      stats: [
        { label: "Classes Today", value: "4", icon: CalendarCheck, accent: "primary", trend: "Next at 10:00 AM" },
        { label: "Students in Class", value: "145", icon: Users, accent: "primary", trend: "Across all classes" },
        { label: "Today's Attendance", value: `${attendanceRate}%`, icon: BarChart3, accent: "primary", trend: "Marked today" },
        { label: "Pending Assessments", value: "18", icon: BookOpen, accent: "warning", trend: "Due this week" },
      ],
      quickLinks: [
        { label: "Mark Attendance", href: "/dashboard/attendance/mark", icon: CalendarCheck },
        { label: "Enter Grades", href: "/dashboard/grades/enter", icon: BarChart3 },
        { label: "Schedule Assessment", href: "/dashboard/assessments/new", icon: BookOpen },
      ],
    },

    ACCOUNTANT: {
      greeting: "Welcome",
      subtitle: "Here's the financial and assessment overview.",
      badge: "Accountant",
      badgeIcon: DollarSign,
      stats: [
        { label: "Total Students", value: totalStudents, icon: Users, accent: "primary", trend: "Enrolled" },
        { label: "Pending Invoices", value: "24", icon: BarChart3, accent: "warning", trend: "KSh 245,000" },
        { label: "Today's Payments", value: "12", icon: DollarSign, accent: "success", trend: "Collected" },
        { label: "Overdue Fees", value: "8", icon: BellRing, accent: "error", trend: "Needs follow-up" },
      ],
      quickLinks: [
        { label: "Manage Fees", href: "/dashboard/fees", icon: DollarSign },
        { label: "View Assessments", href: "/dashboard/assessments", icon: BookOpen },
        { label: "Accountant Dashboard", href: "/dashboard/accountant", icon: BarChart3 },
      ],
    },

    STUDENT: {
      greeting: "Welcome back",
      subtitle: "Here's how your school day looks.",
      badge: "Student",
      badgeIcon: BookOpen,
      stats: [
        { label: "Your Classes", value: "7", icon: CalendarCheck, accent: "primary", trend: "This semester" },
        { label: "Current Average", value: "A-", icon: GraduationCap, accent: "primary", trend: "Top 15% of class" },
        { label: "Attendance Rate", value: "97%", icon: CalendarCheck, accent: "primary", trend: "Excellent standing" },
        { label: "Upcoming Assessments", value: "4", icon: BellRing, accent: "warning", trend: "2 due this week" },
      ],
      quickLinks: [
        { label: "My Timetable", href: "/dashboard/timetable", icon: CalendarDays },
        { label: "My Assessments", href: "/dashboard/assessments", icon: BookOpen },
        { label: "My Grades", href: "/dashboard/grades", icon: GraduationCap },
      ],
    },

    PARENT: {
      greeting: "Hello",
      subtitle: "Stay informed on your children's progress.",
      badge: "Parent",
      badgeIcon: Users,
      stats: [
        { label: "Your Children", value: "2", icon: Users, accent: "primary", trend: "All enrolled" },
        { label: "Overall Average", value: "B+", icon: GraduationCap, accent: "primary", trend: "Good standing" },
        { label: "Attendance This Month", value: "96%", icon: CalendarCheck, accent: "primary", trend: "Above average" },
        { label: "School Notices", value: "5", icon: BellRing, accent: "warning", trend: "2 unread" },
      ],
      quickLinks: [
        { label: "View Children's Progress", href: "/dashboard/children", icon: TrendingUp },
        { label: "Fees & Payments", href: "/dashboard/fees/child", icon: DollarSign },
        { label: "School Notices", href: "/dashboard/announcements", icon: BellRing },
      ],
    },
  };

  const data = roleData[userRole] ?? roleData.ADMIN;
  const BadgeIcon = data.badgeIcon;

  const roleDescriptions: Record<Role, string> = {
    ADMIN: "You have full system access — manage students, staff, classes, assessments, and generate reports from the sidebar.",
    TEACHER: "Your workspace is ready — mark attendance, enter grades, schedule CBC assessments, and manage your classes.",
    ACCOUNTANT: "Manage school finances, track fee payments, and monitor CBC assessment records.",
    STUDENT: "Stay on track — check your timetable, review your CBC assessments and grades, and stay up to date.",
    PARENT: "Stay informed — monitor your children's attendance, academic progress, CBC assessments, and fee status.",
  };

  return (
    <div className="p-6 md:p-8 space-y-8 bg-base-100 min-h-screen">

      {/* Greeting Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary via-primary-focus to-primary rounded-2xl p-8 md:p-10 text-primary-content shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/15 border border-white/20 text-primary-content/80 text-xs font-semibold px-3 py-1.5 rounded-full mb-4 backdrop-blur-sm">
              <BadgeIcon className="w-3.5 h-3.5" />
              {data.badge}
            </div>

            <h1 className="text-3xl md:text-5xl font-black leading-tight mb-2">
              {data.greeting}, <span className="text-secondary">{userName}</span>!
            </h1>
            <p className="text-primary-content/70 text-base md:text-lg">
              {data.subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div>
        <p className="text-xs font-bold text-base-content/40 uppercase tracking-widest mb-4">Overview</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {data.stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-base-100 border border-neutral/40 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all">
                <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <p className="text-xs font-medium text-base-content/50 mb-1">{stat.label}</p>
                <p className="text-3xl font-black text-primary leading-none mb-2">{stat.value}</p>
                <div className="flex items-center gap-1 text-xs text-base-content/40">
                  <TrendingUp className="w-3 h-3" />
                  {stat.trend}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Role Info + Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="md:col-span-2 bg-base-200 border border-neutral/30 rounded-2xl p-6">
          <p className="text-sm font-bold text-base-content mb-1">{data.badge} Access</p>
          <p className="text-sm text-base-content/60 leading-relaxed">
            {roleDescriptions[userRole]}
          </p>
        </div>

        <div className="bg-base-200 border border-neutral/30 rounded-2xl p-6">
          <p className="text-xs font-bold text-base-content/40 uppercase tracking-widest mb-4">Quick Actions</p>
          <ul className="space-y-2">
            {data.quickLinks.map(({ label, href, icon: LinkIcon }) => (
              <li key={label}>
                <a
                  href={href}
                  className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl hover:bg-base-100 group transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center">
                      <LinkIcon className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-sm font-medium text-base-content/80 group-hover:text-base-content">
                      {label}
                    </span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-base-content/30 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}