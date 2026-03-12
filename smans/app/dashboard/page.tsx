// app/dashboard/page.tsx
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import {
  ArrowRight,
  BarChart3,
  BellRing,
  BookOpen,
  CalendarCheck,
  Clock,
  GraduationCap,
  ShieldCheck,
  TrendingUp,
  Users,
} from "lucide-react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

type Role = "ADMIN" | "TEACHER" | "STUDENT" | "PARENT";

export default async function DashboardHome() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/login");
  }

  const userRole = (session.user.role as Role) ?? "STUDENT";
  const userName = session.user.name ?? "User";

  let totalStudents = 0;
  let totalTeachers = 0;
  let attendanceRate = 0;

  try {
    totalStudents = await prisma.student.count();

    totalTeachers = await prisma.user.count({
      where: { role: "TEACHER" },
    });

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    today.setHours(0, 0, 0, 0);
    tomorrow.setHours(0, 0, 0, 0);

    const presentToday = await prisma.attendance.count({
      where: { date: { gte: today, lt: tomorrow }, status: "PRESENT" },
    });

    const totalAttendanceToday = await prisma.attendance.count({
      where: { date: { gte: today, lt: tomorrow } },
    });

    attendanceRate =
      totalAttendanceToday > 0
        ? Math.round((presentToday / totalAttendanceToday) * 100)
        : 0;
  } catch (error) {
    console.error("Dashboard stats error:", error);
  }

  const roleData: Record<
    Role,
    {
      greeting: string;
      subtitle: string;
      badge: string;
      badgeIcon: any;
      stats: any[];
      quickLinks: { label: string; href: string; icon: any }[];
    }
  > = {
    ADMIN: {
      greeting: "Welcome back",
      subtitle: "Here's a full overview of your school today.",
      badge: "Administrator",
      badgeIcon: ShieldCheck,
      stats: [
        {
          label: "Total Students",
          value: totalStudents,
          icon: Users,
          accent: "primary",
          trend: "+12 this month",
        },
        {
          label: "Active Teachers",
          value: totalTeachers,
          icon: GraduationCap,
          accent: "primary",
          trend: "All active",
        },
        {
          label: "Today's Attendance",
          value: `${attendanceRate}%`,
          icon: CalendarCheck,
          accent: "primary",
          trend: "vs yesterday",
        },
        {
          label: "System Alerts",
          value: "3",
          icon: BellRing,
          accent: "error",
          trend: "Needs attention",
        },
      ],
      quickLinks: [
        { label: "Manage Students", href: "/dashboard/students", icon: Users },
        { label: "View Reports", href: "/dashboard/reports", icon: BarChart3 },
        { label: "Notifications", href: "/dashboard/notifications", icon: BellRing },
      ],
    },

    TEACHER: {
      greeting: "Good to see you",
      subtitle: "Here's what's on your plate today.",
      badge: "Teacher",
      badgeIcon: GraduationCap,
      stats: [
        {
          label: "Classes Today",
          value: "4",
          icon: CalendarCheck,
          accent: "primary",
          trend: "Next at 10:00 AM",
        },
        {
          label: "Students in Class",
          value: "145",
          icon: Users,
          accent: "primary",
          trend: "Across all classes",
        },
        {
          label: "Today's Attendance",
          value: `${attendanceRate}%`,
          icon: BarChart3,
          accent: "primary",
          trend: "Marked today",
        },
        {
          label: "Pending Grades",
          value: "18",
          icon: GraduationCap,
          accent: "warning",
          trend: "Due this week",
        },
      ],
      quickLinks: [
        { label: "Mark Attendance", href: "/dashboard/attendance", icon: CalendarCheck },
        { label: "Enter Grades", href: "/dashboard/grades", icon: BookOpen },
        { label: "My Classes", href: "/dashboard/classes", icon: Clock },
      ],
    },

    STUDENT: {
      greeting: "Welcome back",
      subtitle: "Here's how your school day looks.",
      badge: "Student",
      badgeIcon: BookOpen,
      stats: [
        {
          label: "Your Classes",
          value: "7",
          icon: CalendarCheck,
          accent: "primary",
          trend: "This semester",
        },
        {
          label: "Current Average",
          value: "A-",
          icon: GraduationCap,
          accent: "primary",
          trend: "Top 15% of class",
        },
        {
          label: "Attendance Rate",
          value: "97%",
          icon: CalendarCheck,
          accent: "primary",
          trend: "Excellent standing",
        },
        {
          label: "Upcoming Assignments",
          value: "4",
          icon: BellRing,
          accent: "warning",
          trend: "2 due this week",
        },
      ],
      quickLinks: [
        { label: "My Timetable", href: "/dashboard/timetable", icon: Clock },
        { label: "My Grades", href: "/dashboard/grades", icon: GraduationCap },
        { label: "Notices", href: "/dashboard/notices", icon: BellRing },
      ],
    },

    PARENT: {
      greeting: "Hello",
      subtitle: "Stay informed on your children's progress.",
      badge: "Parent",
      badgeIcon: Users,
      stats: [
        {
          label: "Your Children",
          value: "2",
          icon: Users,
          accent: "primary",
          trend: "All enrolled",
        },
        {
          label: "Overall Average",
          value: "B+",
          icon: GraduationCap,
          accent: "primary",
          trend: "Good standing",
        },
        {
          label: "Attendance This Month",
          value: "96%",
          icon: CalendarCheck,
          accent: "primary",
          trend: "Above average",
        },
        {
          label: "School Notices",
          value: "5",
          icon: BellRing,
          accent: "warning",
          trend: "2 unread",
        },
      ],
      quickLinks: [
        { label: "View Progress", href: "/dashboard/progress", icon: TrendingUp },
        { label: "Fee Payments", href: "/dashboard/fees", icon: BarChart3 },
        { label: "School Notices", href: "/dashboard/notices", icon: BellRing },
      ],
    },
  };

  const data = roleData[userRole] ?? roleData.ADMIN;
  const BadgeIcon = data.badgeIcon;

  const roleDescriptions: Record<Role, string> = {
    ADMIN: "You have full system access — manage students, staff, classes, and generate reports from the sidebar.",
    TEACHER: "Your workspace is ready — mark attendance, enter grades, and manage your classes from the sidebar.",
    STUDENT: "Stay on track — check your timetable, review grades, and stay up to date with announcements.",
    PARENT: "Stay informed — monitor your children's attendance, academic progress, and fee status.",
  };

  const accentMap: Record<string, string> = {
    primary: "text-primary",
    error: "text-error",
    warning: "text-warning",
    success: "text-success",
  };

  const bgMap: Record<string, string> = {
    primary: "bg-primary/10",
    error: "bg-error/10",
    warning: "bg-warning/10",
    success: "bg-success/10",
  };

  return (
    <div className="p-6 md:p-8 space-y-8 bg-base-100 min-h-screen">

      {/* ── Greeting Banner ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary via-primary-focus to-primary rounded-2xl p-8 md:p-10 text-primary-content shadow-xl">
        {/* Decorative blobs */}
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-secondary/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-primary-content/5 blur-3xl pointer-events-none" />
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            {/* Role badge */}
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

          {/* Quick date/time pill */}
          <div className="flex-shrink-0 bg-white/10 border border-white/20 rounded-xl px-5 py-4 backdrop-blur-sm text-center min-w-[140px]">
            <p className="text-primary-content/60 text-xs font-medium uppercase tracking-wide mb-1">Today</p>
            <p className="text-primary-content font-bold text-lg">
              {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
            </p>
          </div>
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div>
        <p className="text-xs font-bold text-base-content/40 uppercase tracking-widest mb-4">Overview</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {data.stats.map((stat, index) => {
            const Icon = stat.icon;
            const colorClass = accentMap[stat.accent] ?? "text-primary";
            const bgClass = bgMap[stat.accent] ?? "bg-primary/10";

            return (
              <div
                key={index}
                className="group relative bg-base-100 border border-neutral/40 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
              >
                {/* Subtle bg circle */}
                <div className={`absolute top-0 right-0 w-28 h-28 ${bgClass} rounded-full -translate-y-1/2 translate-x-1/2 opacity-50 group-hover:opacity-80 transition-opacity duration-300`} />

                <div className={`w-11 h-11 ${bgClass} rounded-xl flex items-center justify-center mb-4`}>
                  <Icon className={`w-5 h-5 ${colorClass}`} />
                </div>

                <p className="text-xs font-medium text-base-content/50 mb-1">{stat.label}</p>
                <p className={`text-3xl font-black ${colorClass} leading-none mb-2`}>{stat.value}</p>

                <div className="flex items-center gap-1 text-xs text-base-content/40">
                  <TrendingUp className="w-3 h-3" />
                  {stat.trend}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Bottom Row: Role Info + Quick Links ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

        {/* Role description */}
        <div className="md:col-span-2 bg-base-200 border border-neutral/30 rounded-2xl p-6 flex items-start gap-4">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
            <BadgeIcon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-bold text-base-content mb-1">{data.badge} Access</p>
            <p className="text-sm text-base-content/60 leading-relaxed">
              {roleDescriptions[userRole]}
            </p>
          </div>
        </div>

        {/* Quick links */}
        <div className="bg-base-200 border border-neutral/30 rounded-2xl p-6">
          <p className="text-xs font-bold text-base-content/40 uppercase tracking-widest mb-4">Quick Actions</p>
          <ul className="space-y-2">
            {data.quickLinks.map(({ label, href, icon: LinkIcon }) => (
              <li key={label}>
                <a
                  href={href}
                  className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl hover:bg-base-100 group transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center">
                      <LinkIcon className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-sm font-medium text-base-content/80 group-hover:text-base-content transition-colors">
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