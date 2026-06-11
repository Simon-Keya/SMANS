// app/dashboard/reports/attendance/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function AttendanceReportsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Fix: Use 'status' field instead of 'present'
  const presentToday = await prisma.attendance.count({
    where: { date: today, status: "PRESENT" },
  });

  const totalToday = await prisma.attendance.count({
    where: { date: today },
  });

  const attendanceRate = totalToday > 0 ? Math.round((presentToday / totalToday) * 100) : 0;

  // Get this week's data
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());

  const weeklyStats = await prisma.attendance.findMany({
    where: {
      date: {
        gte: startOfWeek,
        lte: today,
      },
    },
    select: { status: true },
  });

  let weeklyPresent = 0;
  let weeklyAbsent = 0;
  let weeklyLate = 0;

  for (const record of weeklyStats) {
    if (record.status === "PRESENT") weeklyPresent++;
    else if (record.status === "ABSENT") weeklyAbsent++;
    else if (record.status === "LATE") weeklyLate++;
  }

  const weeklyTotal = weeklyStats.length;
  const weeklyRate = weeklyTotal > 0 ? Math.round((weeklyPresent / weeklyTotal) * 100) : 0;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-primary">Attendance Reports</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-base-100 shadow-lg border border-base-200">
          <CardHeader>
            <CardTitle className="text-xl text-primary">Today's Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-primary">{attendanceRate}%</p>
            <p className="text-sm text-base-content/60">
              {presentToday} present out of {totalToday}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-base-100 shadow-lg border border-base-200">
          <CardHeader>
            <CardTitle className="text-xl text-primary">This Week's Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-primary">{weeklyRate}%</p>
            <p className="text-sm text-base-content/60">
              {weeklyPresent} present, {weeklyAbsent} absent, {weeklyLate} late
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Additional stats can be added here */}
    </div>
  );
}