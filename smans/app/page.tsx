import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BarChart3, BellRing, CalendarCheck, GraduationCap, Users } from "lucide-react";
import { getServerSession } from "next-auth";

export default async function DashboardHome() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return null; 
  }

  const userRole = (session.user.role as string)?.toLowerCase() || "student";
  const userName = session.user.name || "User";

  // Real DB queries
  const totalStudents = await prisma.student.count();
  const totalTeachers = await prisma.user.count({ where: { role: "teacher" } });

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

  // Role-based content (greeting + stats)
  const roleData = {
    admin: {
      greeting: "Welcome back, Administrator",
      stats: [
        { label: "Total Students", value: totalStudents, icon: Users, color: "text-emerald-600" },
        { label: "Active Teachers", value: totalTeachers, icon: GraduationCap, color: "text-emerald-600" },
        { label: "Today's Attendance", value: `${attendanceRate}%`, icon: CalendarCheck, color: "text-emerald-600" },
        { label: "System Alerts", value: "3", icon: BellRing, color: "text-red-600" },
      ],
    },
    teacher: {
      greeting: "Good to see you, Teacher",
      stats: [
        { label: "Your Classes Today", value: "4", icon: CalendarCheck, color: "text-emerald-600" },
        { label: "Students in Class", value: "145", icon: Users, color: "text-emerald-600" },
        { label: "Today's Attendance", value: `${attendanceRate}%`, icon: BarChart3, color: "text-emerald-600" },
        { label: "Pending Grades", value: "18", icon: GraduationCap, color: "text-amber-600" },
      ],
    },
    student: {
      greeting: "Welcome back!",
      stats: [
        { label: "Your Classes", value: "7", icon: CalendarCheck, color: "text-emerald-600" },
        { label: "Current Average", value: "A-", icon: GraduationCap, color: "text-emerald-600" },
        { label: "Attendance Rate", value: "97%", icon: CalendarCheck, color: "text-emerald-600" },
        { label: "Upcoming Assignments", value: "4", icon: BellRing, color: "text-amber-600" },
      ],
    },
    parent: {
      greeting: "Hello Parent",
      stats: [
        { label: "Your Children", value: "2", icon: Users, color: "text-emerald-600" },
        { label: "Overall Average", value: "B+", icon: GraduationCap, color: "text-emerald-600" },
        { label: "Attendance This Month", value: "96%", icon: CalendarCheck, color: "text-emerald-600" },
        { label: "School Notices", value: "5", icon: BellRing, color: "text-amber-600" },
      ],
    },
  };

  const data = roleData[userRole as keyof typeof roleData] || roleData.admin;

  return (
    <div className="space-y-8">
      {/* Greeting Header - reverted to dark emerald style */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-8 rounded-2xl text-white shadow-2xl">
        <h1 className="text-4xl md:text-5xl font-bold mb-3">
          {data.greeting}, {userName}!
        </h1>
        <p className="text-xl opacity-90">
          Here's a quick overview of your school day.
        </p>
      </div>

      {/* Stats Grid */}
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

      {/* Role Message - reverted to slate style */}
      <div className="bg-slate-100 border border-slate-200 rounded-lg p-6 text-slate-700">
        <span>
          {userRole === "admin" && "Full access: manage students, teachers, and reports."}
          {userRole === "teacher" && "Focus on teaching: mark attendance and enter grades."}
          {userRole === "student" && "Stay on track: check timetable and grades."}
          {userRole === "parent" && "Stay informed: monitor attendance and progress."}
        </span>
      </div>
    </div>
  );
}