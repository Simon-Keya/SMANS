// app/dashboard/page.tsx
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import {
  BarChart3,
  BellRing,
  CalendarCheck,
  GraduationCap,
  Users,
} from "lucide-react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

// Use uppercase to match Prisma Role enum
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
      where: {
        date: { gte: today, lt: tomorrow },
        status: "PRESENT",
      },
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

  const roleData: Record<Role, { greeting: string; stats: any[] }> = {
    ADMIN: {
      greeting: "Welcome back, Administrator",
      stats: [
        {
          label: "Total Students",
          value: totalStudents,
          icon: Users,
          color: "text-primary",
        },
        {
          label: "Active Teachers",
          value: totalTeachers,
          icon: GraduationCap,
          color: "text-primary",
        },
        {
          label: "Today's Attendance",
          value: `${attendanceRate}%`,
          icon: CalendarCheck,
          color: "text-primary",
        },
        {
          label: "System Alerts",
          value: "3",
          icon: BellRing,
          color: "text-error",
        },
      ],
    },

    TEACHER: {
      greeting: "Good to see you, Teacher",
      stats: [
        {
          label: "Your Classes Today",
          value: "4",
          icon: CalendarCheck,
          color: "text-primary",
        },
        {
          label: "Students in Class",
          value: "145",
          icon: Users,
          color: "text-primary",
        },
        {
          label: "Today's Attendance",
          value: `${attendanceRate}%`,
          icon: BarChart3,
          color: "text-primary",
        },
        {
          label: "Pending Grades",
          value: "18",
          icon: GraduationCap,
          color: "text-warning",
        },
      ],
    },

    STUDENT: {
      greeting: "Welcome back",
      stats: [
        {
          label: "Your Classes",
          value: "7",
          icon: CalendarCheck,
          color: "text-primary",
        },
        {
          label: "Current Average",
          value: "A-",
          icon: GraduationCap,
          color: "text-primary",
        },
        {
          label: "Attendance Rate",
          value: "97%",
          icon: CalendarCheck,
          color: "text-primary",
        },
        {
          label: "Upcoming Assignments",
          value: "4",
          icon: BellRing,
          color: "text-warning",
        },
      ],
    },

    PARENT: {
      greeting: "Hello Parent",
      stats: [
        {
          label: "Your Children",
          value: "2",
          icon: Users,
          color: "text-primary",
        },
        {
          label: "Overall Average",
          value: "B+",
          icon: GraduationCap,
          color: "text-primary",
        },
        {
          label: "Attendance This Month",
          value: "96%",
          icon: CalendarCheck,
          color: "text-primary",
        },
        {
          label: "School Notices",
          value: "5",
          icon: BellRing,
          color: "text-warning",
        },
      ],
    },
  };

  const data = roleData[userRole] ?? roleData.ADMIN;

  return (
    <div className="p-6 space-y-8 bg-base-100 min-h-screen">
      {/* Greeting */}
      <div className="bg-gradient-to-r from-primary to-primary-focus p-8 rounded-2xl text-primary-content shadow-2xl">
        <h1 className="text-4xl md:text-5xl font-bold mb-3">
          {data.greeting}, {userName}!
        </h1>
        <p className="text-xl opacity-90">
          Here's a quick overview of your school day.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {data.stats.map((stat, index) => {
          const Icon = stat.icon;

          return (
            <Card
              key={index}
              className="border border-neutral bg-base-100 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Icon className={`w-8 h-8 ${stat.color}`} />
                </div>

                <div>
                  <p className="text-sm text-muted">{stat.label}</p>
                  <CardTitle className={`text-3xl font-bold ${stat.color} mt-1`}>
                    {stat.value}
                  </CardTitle>
                </div>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      {/* Role info */}
      <div className="bg-base-200 border border-neutral rounded-lg p-6 text-base-content">
        {userRole === "ADMIN" &&
          "Full access: manage students, teachers, and reports."}

        {userRole === "TEACHER" &&
          "Focus on teaching: mark attendance and enter grades."}

        {userRole === "STUDENT" &&
          "Stay on track: check timetable and grades."}

        {userRole === "PARENT" &&
          "Stay informed: monitor attendance and progress."}
      </div>
    </div>
  );
}