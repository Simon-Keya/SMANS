import Navbar from "@/components/dashboard/Navbar";
import Sidebar from "@/components/dashboard/Sidebar";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BarChart3, BellRing, CalendarCheck, GraduationCap, Users } from "lucide-react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/login?callbackUrl=/dashboard");
  }

  const userRole = session.user.role as "admin" | "teacher" | "student" | "parent";
  const userName = session.user.name || "User";
  const userId = session.user.id as string;

  // Real database queries
  const totalStudents = await prisma.student.count();
  const totalTeachers = await prisma.user.count({ where: { role: "teacher" } });
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todaysAttendance = await prisma.attendance.count({
    where: {
      date: today,
      present: true,
    },
  });

  const totalAttendanceToday = await prisma.attendance.count({
    where: { date: today },
  });

  const attendancePercentage = totalAttendanceToday > 0
    ? Math.round((todaysAttendance / totalAttendanceToday) * 100)
    : 0;

  // Role-specific stats from DB
  const roleData = {
    admin: {
      greeting: "Manage your school with confidence",
      stats: [
        { label: "Total Students", value: totalStudents.toString(), icon: Users },
        { label: "Active Teachers", value: totalTeachers.toString(), icon: GraduationCap },
        { label: "Today's Attendance", value: `${attendancePercentage}%`, icon: CalendarCheck },
        { label: "Classes Today", value: "156", icon: BarChart3 }, // Could be calculated from timetable
      ],
    },
    teacher: {
      greeting: "Welcome to your teaching hub",
      stats: [
        { label: "Your Classes", value: "6", icon: CalendarCheck }, // Query timetable for teacher
        { label: "Students Today", value: "178", icon: Users },
        { label: "Attendance Rate", value: `${attendancePercentage}%`, icon: BarChart3 },
        { label: "Pending Grades", value: "23", icon: GraduationCap },
      ],
    },
    student: {
      greeting: "Keep up the great work!",
      stats: [
        { label: "Enrolled Classes", value: "8", icon: BarChart3 },
        { label: "Current Average", value: "A-", icon: GraduationCap },
        { label: "Attendance Rate", value: "98%", icon: CalendarCheck },
        { label: "Upcoming Tests", value: "3", icon: BellRing },
      ],
    },
    parent: {
      greeting: "Stay connected with your child's progress",
      stats: [
        { label: "Children", value: "2", icon: Users },
        { label: "Overall Average", value: "B+", icon: GraduationCap },
        { label: "Attendance This Week", value: "95%", icon: CalendarCheck },
        { label: "Recent Reports", value: "2", icon: BellRing },
      ],
    },
  };

  const config = roleData[userRole] || roleData.admin;

  return (
    <div className="flex h-screen bg-base-100">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />

        <main className="flex-1 overflow-y-auto bg-base-200">
          <div className="container mx-auto px-4 py-8 max-w-7xl">
            <div className="mb-10">
              <h1 className="text-4xl font-bold text-primary mb-2">
                Welcome back, {userName}!
              </h1>
              <p className="text-xl text-base-content/70">{config.greeting}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              {config.stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <Card
                    key={index}
                    className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 border border-primary/10"
                  >
                    <CardHeader className="flex flex-row items-center gap-4 pb-3">
                      <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Icon className="w-8 h-8 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-base-content/60">{stat.label}</p>
                        <CardTitle className="text-3xl font-bold text-primary mt-1">
                          {stat.value}
                        </CardTitle>
                      </div>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>

            <div className="bg-base-100 rounded-box shadow-lg p-6 md:p-8 border border-base-300">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}