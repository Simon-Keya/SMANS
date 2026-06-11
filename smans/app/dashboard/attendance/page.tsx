import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AttendanceDashboard() {
  const session = await getServerSession();
  
  if (!session) {
    redirect("/auth/login");
  }

  // Get today's date (without time)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Count present students today (using status field)
  const presentToday = await prisma.attendance.count({
    where: { 
      date: today, 
      status: "PRESENT" 
    },
  });

  // Count total attendance records today
  const totalToday = await prisma.attendance.count({
    where: { date: today },
  });

  // Calculate attendance rate for today
  const attendanceRate = totalToday > 0 ? (presentToday / totalToday) * 100 : 0;

  // Get this week's attendance summary
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay()); // Start from Sunday

  const weeklyAttendance = await prisma.attendance.groupBy({
    by: ["status"],
    where: {
      date: {
        gte: startOfWeek,
        lte: today,
      },
    },
    _count: {
      status: true,
    },
  });

  // Calculate weekly totals
  let weeklyPresent = 0;
  let weeklyAbsent = 0;
  let weeklyLate = 0;

  weeklyAttendance.forEach((item) => {
    if (item.status === "PRESENT") weeklyPresent = item._count.status;
    if (item.status === "ABSENT") weeklyAbsent = item._count.status;
    if (item.status === "LATE") weeklyLate = item._count.status;
  });

  const weeklyTotal = weeklyPresent + weeklyAbsent + weeklyLate;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-primary">Attendance Dashboard</h1>

      {/* Today's Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-base-100 shadow-lg border border-base-200">
          <CardHeader>
            <CardTitle className="text-xl text-primary">Today's Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">{presentToday}</div>
            <p className="text-sm text-base-content/60">Students Present</p>
            <div className="mt-2 text-sm">
              out of {totalToday} total records
            </div>
          </CardContent>
        </Card>

        <Card className="bg-base-100 shadow-lg border border-base-200">
          <CardHeader>
            <CardTitle className="text-xl text-primary">Attendance Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {attendanceRate.toFixed(1)}%
            </div>
            <p className="text-sm text-base-content/60">of students present today</p>
          </CardContent>
        </Card>

        <Card className="bg-base-100 shadow-lg border border-base-200">
          <CardHeader>
            <CardTitle className="text-xl text-primary">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full">
              <Link href="/dashboard/attendance/mark">Mark Today's Attendance</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard/attendance/report">View Reports</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Summary */}
      {weeklyTotal > 0 && (
        <Card className="bg-base-100 shadow-lg border border-base-200">
          <CardHeader>
            <CardTitle className="text-xl text-primary">This Week's Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-success/10 rounded-lg">
                <div className="text-2xl font-bold text-success">{weeklyPresent}</div>
                <div className="text-sm text-base-content/60">Present</div>
              </div>
              <div className="text-center p-4 bg-warning/10 rounded-lg">
                <div className="text-2xl font-bold text-warning">{weeklyLate}</div>
                <div className="text-sm text-base-content/60">Late</div>
              </div>
              <div className="text-center p-4 bg-error/10 rounded-lg">
                <div className="text-2xl font-bold text-error">{weeklyAbsent}</div>
                <div className="text-sm text-base-content/60">Absent</div>
              </div>
            </div>
            <div className="mt-4 text-center text-sm text-base-content/60">
              Total attendance records this week: {weeklyTotal}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-base-100 shadow-lg border border-base-200">
          <CardHeader>
            <CardTitle className="text-xl text-primary">Generate Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base-content/70 mb-4">
              View detailed attendance reports by class, student, or date range
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard/attendance/report">Generate Report</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-base-100 shadow-lg border border-base-200">
          <CardHeader>
            <CardTitle className="text-xl text-primary">Class Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base-content/70 mb-4">
              View attendance summary by class and identify patterns
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard/attendance/classes">View Classes</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}