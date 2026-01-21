// components/attendance/AttendanceSummary.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

interface SummaryProps {
  present: number;
  total: number;
  rate: number;
}

export default function AttendanceSummary({ present, total, rate }: SummaryProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="bg-base-100 shadow-lg border-base-200">
        <CardHeader>
          <CardTitle className="text-lg text-primary">Present Today</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-success">{present}</p>
        </CardContent>
      </Card>

      <Card className="bg-base-100 shadow-lg border-base-200">
        <CardHeader>
          <CardTitle className="text-lg text-primary">Total Students</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{total}</p>
        </CardContent>
      </Card>

      <Card className="bg-base-100 shadow-lg border-base-200">
        <CardHeader>
          <CardTitle className="text-lg text-primary">Attendance Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-primary">{rate}%</p>
        </CardContent>
      </Card>
    </div>
  );
}