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

  // Get today's date range
  const today = new Date();
  const startOfDay = new Date(today);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);

  try {
    // Fetch today's attendance records
    const todaysAttendance = await prisma.attendance.findMany({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      select: {
        status: true,
      },
    });

    // Calculate statistics
    let present = 0;
    let absent = 0;
    let late = 0;

    for (const record of todaysAttendance) {
      if (record.status === "PRESENT") present++;
      else if (record.status === "ABSENT") absent++;
      else if (record.status === "LATE") late++;
    }

    const total = todaysAttendance.length;
    const attendanceRate = total > 0 ? (present / total) * 100 : 0;

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
              <div className="text-3xl font-bold text-success">{present}</div>
              <p className="text-sm text-base-content/60">Students present today</p>
            </CardContent>
          </Card>

          <Card className="bg-base-100 shadow-lg border border-base-200">
            <CardHeader>
              <CardTitle className="text-xl text-primary">Absent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-error">{absent}</div>
              <p className="text-sm text-base-content/60">Students absent today</p>
            </CardContent>
          </Card>

          <Card className="bg-base-100 shadow-lg border border-base-200">
            <CardHeader>
              <CardTitle className="text-xl text-primary">Late</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-warning">{late}</div>
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
  } catch (error) {
    console.error("Error fetching attendance data:", error);
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-primary">Attendance Dashboard</h1>
        <Card className="bg-base-100 shadow-lg border border-base-200">
          <CardContent className="py-8">
            <p className="text-center text-error">Error loading attendance data. Please try again later.</p>
          </CardContent>
        </Card>
      </div>
    );
  }
}