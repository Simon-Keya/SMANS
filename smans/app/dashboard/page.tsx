// app/dashboard/page.tsx Dashboard page
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  BarChart3,
  BellRing,
  CalendarCheck,
  GraduationCap,
  Users,
} from "lucide-react";
import { getServerSession } from "next-auth";

export default async function DashboardHome() {
  const session = await getServerSession(authOptions);

  if (!session?.user) return null;

  const userRole = session.user.role as
    | "admin"
    | "teacher"
    | "student"
    | "parent";

  const userName = session.user.name || "User";

  // ---------- DATABASE QUERIES ----------
  const totalStudents = await prisma.student.count();
  const totalTeachers = await prisma.user.count({
    where: { role: "teacher" },
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const presentToday = await prisma.attendance.count({
    where: { date: today, present: true },
  });

  const totalAttendanceToday = await prisma.attendance.count({
    where: { date: today },
  });

  const attendanceRate =
    totalAttendanceToday > 0
      ? Math.round((presentToday / totalAttendanceToday) * 100)
      : 0;

  // ---------- ROLE CONFIG ----------
  const roleData = {
    admin: {
      greeting: "Manage your school with confidence",
      stats: [
        { label: "Total Students", value: totalStudents, icon: Users },
        { label: "Active Teachers", value: totalTeachers, icon: GraduationCap },
        {
          label: "Today's Attendance",
          value: `${attendanceRate}%`,
          icon: CalendarCheck,
        },
        { label: "Classes Today", value: 156, icon: BarChart3 },
      ],
    },
    teacher: {
      greeting: "Welcome to your teaching hub",
      stats: [
        { label: "Your Classes", value: 6, icon: CalendarCheck },
        { label: "Students Today", value: 178, icon: Users },
        {
          label: "Attendance Rate",
          value: `${attendanceRate}%`,
          icon: BarChart3,
        },
        { label: "Pending Grades", value: 23, icon: GraduationCap },
      ],
    },
    student: {
      greeting: "Keep up the great work!",
      stats: [
        { label: "Enrolled Classes", value: 8, icon: BarChart3 },
        { label: "Current Average", value: "A-", icon: GraduationCap },
        { label: "Attendance Rate", value: "98%", icon: CalendarCheck },
        { label: "Upcoming Tests", value: 3, icon: BellRing },
      ],
    },
    parent: {
      greeting: "Stay connected with your child's progress",
      stats: [
        { label: "Children", value: 2, icon: Users },
        { label: "Overall Average", value: "B+", icon: GraduationCap },
        { label: "Attendance This Week", value: "95%", icon: CalendarCheck },
        { label: "Recent Reports", value: 2, icon: BellRing },
      ],
    },
  };

  const config = roleData[userRole];

  return (
    <div>
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-primary mb-2">
          Welcome back, {userName}!
        </h1>
        <p className="text-xl text-base-content/70">
          {config.greeting}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {config.stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card
              key={index}
              className="bg-base-100 shadow-xl border border-primary/10"
            >
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Icon className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-base-content/60">
                    {stat.label}
                  </p>
                  <CardTitle className="text-3xl font-bold text-primary">
                    {stat.value}
                  </CardTitle>
                </div>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      {/* Role Message */}
      <div className="alert alert-info">
        <span>
          {userRole === "admin" &&
            "You have full access to all school management features."}
          {userRole === "teacher" &&
            "Check your classes and mark attendance for today."}
          {userRole === "student" &&
            "View your grades and upcoming assignments."}
          {userRole === "parent" &&
            "Monitor your child's progress and attendance."}
        </span>
      </div>
    </div>
  );
}
