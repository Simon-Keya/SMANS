import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import Link from "next/link";

export default async function AttendanceDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-primary">Attendance Dashboard</h1>

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