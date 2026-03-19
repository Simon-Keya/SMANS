// components/attendance/AttendanceSummary.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

interface AttendanceSummaryProps {
  totalDays: number;
  presentDays: number;
  percentage: number;
}

export default function AttendanceSummary({
  totalDays,
  presentDays,
  percentage,
}: AttendanceSummaryProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Present Days Card */}
      <Card className="bg-base-100 shadow-lg border-base-200 transition-all hover:shadow-xl">
        <CardHeader>
          <CardTitle className="text-lg text-primary">Present Today</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold text-success">{presentDays}</p>
          <p className="text-sm text-base-content/60 mt-1">
            out of {totalDays} students
          </p>
        </CardContent>
      </Card>

      {/* Total Students Card */}
      <Card className="bg-base-100 shadow-lg border-base-200 transition-all hover:shadow-xl">
        <CardHeader>
          <CardTitle className="text-lg text-primary">Total Students</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold">{totalDays}</p>
          <p className="text-sm text-base-content/60 mt-1">Enrolled</p>
        </CardContent>
      </Card>

      {/* Attendance Rate Card */}
      <Card className="bg-base-100 shadow-lg border-base-200 transition-all hover:shadow-xl">
        <CardHeader>
          <CardTitle className="text-lg text-primary">Attendance Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold text-primary">{percentage}%</p>
          <p className="text-sm text-base-content/60 mt-1">
            {presentDays} present today
          </p>
        </CardContent>
      </Card>
    </div>
  );
}