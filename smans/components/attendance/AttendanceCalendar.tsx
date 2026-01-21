// components/attendance/AttendanceCalendar.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

export default function AttendanceCalendar() {
  return (
    <Card className="bg-base-100 shadow-lg border-base-200">
      <CardHeader>
        <CardTitle className="text-xl text-primary">Attendance Calendar</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12 text-base-content/60">
          Interactive calendar coming soon...
          <p className="mt-2 text-sm">
            (You can integrate FullCalendar or react-big-calendar here)
          </p>
        </div>
      </CardContent>
    </Card>
  );
}