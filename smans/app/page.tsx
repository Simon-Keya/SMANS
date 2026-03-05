// app/dashboard/page.tsx (or wherever this dashboard lives)
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

// Use uppercase to match Prisma Role enum and your other files
type Role = "ADMIN" | "TEACHER" | "STUDENT" | "PARENT";

export default async function DashboardHome() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/login");
  }

  // Safely cast role (Prisma returns uppercase enum values)
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
        date: {
          gte: today,
          lt: tomorrow,
        },
        status: "PRESENT",
      },
    });

    const totalAttendanceToday = await prisma.attendance.count({
      where: {
        date: {
          gte: today,
          lt: tomorrow,
        },
      },
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
          color: "text-emerald-600",
        },
        {
          label: "Active Teachers",
          value: totalTeachers,
          icon: GraduationCap,
          color: "text-emerald-600",
        },
        {
          label: "Today's Attendance",
          value: `${attendanceRate}%`,
          icon: CalendarCheck,
          color: "text-emerald-600",
        },
        {
          label: "System Alerts",
          value: "3",
          icon: BellRing,
          color: "text-red-600",
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
          color: "text-emerald-600",
        },
        {
          label: "Students in Class",
          value: "145",
          icon: Users,
          color: "text-emerald-600",
        },
        {
          label: "Today's Attendance",
          value: `${attendanceRate}%`,
          icon: BarChart3,
          color: "text-emerald-600",
        },
        {
          label: "Pending Grades",
          value: "18",
          icon: GraduationCap,
          color: "text-amber-600",
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
          color: "text-emerald-600",
        },
        {
          label: "Current Average",
          value: "A-",
          icon: GraduationCap,
          color: "text-emerald-600",
        },
        {
          label: "Attendance Rate",
          value: "97%",
          icon: CalendarCheck,
          color: "text-emerald-600",
        },
        {
          label: "Upcoming Assignments",
          value: "4",
          icon: BellRing,
          color: "text-amber-600",
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
          color: "text-emerald-600",
        },
        {
          label: "Overall Average",
          value: "B+",
          icon: GraduationCap,
          color: "text-emerald-600",
        },
        {
          label: "Attendance This Month",
          value: "96%",
          icon: CalendarCheck,
          color: "text-emerald-600",
        },
        {
          label: "School Notices",
          value: "5",
          icon: BellRing,
          color: "text-amber-600",
        },
      ],
    },
  };

  // Fallback to admin if role is invalid
  const data = roleData[userRole] ?? roleData.ADMIN;

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-8 rounded-2xl text-white shadow-2xl">
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
              className="border border-slate-200 bg-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <Icon className={`w-8 h-8 ${stat.color}`} />
                </div>

                <div>
                  <p className="text-sm text-slate-600">{stat.label}</p>
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
      <div className="bg-slate-100 border border-slate-200 rounded-lg p-6 text-slate-700">
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