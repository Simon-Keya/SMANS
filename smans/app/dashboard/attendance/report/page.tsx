import AttendanceSummary from "@/components/attendance/AttendanceSummary";
import AttendanceTable from "@/components/attendance/AttendanceTable";

export default async function AttendanceReportPage() {
  const summary = { totalDays: 100, presentDays: 92, percentage: 92 };

  // Explicitly type the array to match AttendanceRecord
  const records: { date: string; status: "present" | "absent" | "late" }[] = [
    { date: "2025-12-28", status: "present" },
    { date: "2025-12-27", status: "absent" },
    { date: "2025-12-26", status: "late" },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Attendance Report</h1>
      <AttendanceSummary {...summary} />
      <div>
        <h2 className="text-2xl font-semibold mb-4">Recent Records</h2>
        <AttendanceTable records={records} />
      </div>
    </div>
  );
}