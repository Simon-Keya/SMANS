import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BellRing, CalendarCheck, Users } from "lucide-react";
import { getServerSession } from "next-auth";

export default async function DashboardHome() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return null;
  }

  const userRole = session.user.role as string;

  // Real data from DB
  const totalStudents = await prisma.student.count();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todaysPresent = await prisma.attendance.count({
    where: { date: today, present: true },
  });

  const totalAttendanceToday = await prisma.attendance.count({
    where: { date: today },
  });

  const attendanceRate = totalAttendanceToday > 0
    ? Math.round((todaysPresent / totalAttendanceToday) * 100)
    : 0;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="card bg-base-100 shadow-xl">
          <CardHeader className="flex flex-row items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">Total Students</CardTitle>
              <p className="text-3xl font-bold text-primary mt-2">{totalStudents}</p>
            </div>
          </CardHeader>
        </Card>

        <Card className="card bg-base-100 shadow-xl">
          <CardHeader className="flex flex-row items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
              <CalendarCheck className="w-6 h-6 text-success" />
            </div>
            <div>
              <CardTitle className="text-xl">Today's Attendance</CardTitle>
              <p className="text-3xl font-bold text-success mt-2">{attendanceRate}%</p>
            </div>
          </CardHeader>
        </Card>

        <Card className="card bg-base-100 shadow-xl">
          <CardHeader className="flex flex-row items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
              <BellRing className="w-6 h-6 text-accent" />
            </div>
            <div>
              <CardTitle className="text-xl">Upcoming Events</CardTitle>
              <p className="text-lg text-base-content/80 mt-2">
                Parent-Teacher Meeting - Jan 5
              </p>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Role-specific message */}
      <div className="alert alert-info">
        <span>
          {userRole === "admin" && "You have full access to all school management features."}
          {userRole === "teacher" && "Check your classes and mark attendance for today."}
          {userRole === "student" && "View your grades and upcoming assignments."}
          {userRole === "parent" && "Monitor your child's progress and attendance."}
        </span>
      </div>
    </div>
  );
}