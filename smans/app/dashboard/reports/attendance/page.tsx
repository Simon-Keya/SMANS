import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { authOptions } from "@/lib/auth";
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

  const presentToday = await prisma.attendance.count({
    where: { date: today, present: true },
  });

  const totalToday = await prisma.attendance.count({
    where: { date: today },
  });

  const attendanceRate = totalToday > 0 ? Math.round((presentToday / totalToday) * 100) : 0;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-primary">Attendance Reports</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

        {/* Add more stats: weekly, monthly, class-wise, etc. */}
      </div>

      {/* You can add charts, filters, export buttons here */}
    </div>
  );
}