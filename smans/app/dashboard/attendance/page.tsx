// app/dashboard/reports/attendance/page.tsx
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

  // Get all attendance records for today
  const todaysRecords = await prisma.attendance.findMany({
    where: { date: today },
  });

  // Calculate statistics from the records
  let presentToday = 0;
  let absentToday = 0;
  let lateToday = 0;

  todaysRecords.forEach((record) => {
    if (record.status === "PRESENT") presentToday++;
    if (record.status === "ABSENT") absentToday++;
    if (record.status === "LATE") lateToday++;
  });

  const totalToday = todaysRecords.length;
  const attendanceRate = totalToday > 0 ? (presentToday / totalToday) * 100 : 0;

  // Get this week's attendance summary
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());

  const weeklyRecords = await prisma.attendance.findMany({
    where: {
      date: {
        gte: startOfWeek,
        lte: today,
      },
    },
  });

  // Calculate weekly statistics
  let weeklyPresent = 0;
  let weeklyAbsent = 0;
  let weeklyLate = 0;

  weeklyRecords.forEach((record) => {
    if (record.status === "PRESENT") weeklyPresent++;
    if (record.status === "ABSENT") weeklyAbsent++;
    if (record.status === "LATE") weeklyLate++;
  });

  const weeklyTotal = weeklyRecords.length;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-primary">Attendance Dashboard</h1>

      {/* Today's Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-base-100 shadow-lg border border-base-200">
          <CardHeader>
            <CardTitle className="text-xl text-primary">Present</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">{presentToday}</div>
            <p className="text-sm text-base-content/60">Students present today</p>
          </CardContent>
        </Card>

        <Card className="bg-base-100 shadow-lg border border-base-200">
          <CardHeader>
            <CardTitle className="text-xl text-primary">Absent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-error">{absentToday}</div>
            <p className="text-sm text-base-content/60">Students absent today</p>
          </CardContent>
        </Card>

        <Card className="bg-base-100 shadow-lg border border-base-200">
          <CardHeader>
            <CardTitle className="text-xl text-primary">Late</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-warning">{lateToday}</div>
            <p className="text-sm text-base-content/60">Students late today</p>
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
            <p className="text-sm text-base-content/60">Overall attendance</p>
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

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-base-100 shadow-lg border border-base-200">
          <CardHeader>
            <CardTitle className="text-xl text-primary">Mark Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base-content/70 mb-4">
              Record today's attendance for your classes
            </p>
            <Button asChild className="w-full">
              <Link href="/dashboard/attendance/mark">Mark Today's Attendance</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-base-100 shadow-lg border border-base-200">
          <CardHeader>
            <CardTitle className="text-xl text-primary">View Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base-content/70 mb-4">
              Generate detailed attendance reports and analytics
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard/attendance/report">Attendance Reports</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}