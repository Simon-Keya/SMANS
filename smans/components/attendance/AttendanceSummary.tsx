import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

interface AttendanceSummaryProps {
  totalDays: number;
  presentDays: number;
  percentage: number;
}

export default function AttendanceSummary({ totalDays, presentDays, percentage }: AttendanceSummaryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Attendance Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold">{totalDays}</p>
            <p className="text-sm text-muted-foreground">Total Days</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">{presentDays}</p>
            <p className="text-sm text-muted-foreground">Present</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-red-600">{totalDays - presentDays}</p>
            <p className="text-sm text-muted-foreground">Absent</p>
          </div>
        </div>
        <div className="text-center">
          <p className="text-4xl font-bold">{percentage.toFixed(1)}%</p>
          <p className="text-sm text-muted-foreground">Overall Attendance</p>
        </div>
      </CardContent>
    </Card>
  );
}