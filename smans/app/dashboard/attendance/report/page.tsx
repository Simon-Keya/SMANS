import AttendanceSummary from "@/components/attendance/AttendanceSummary";
import AttendanceTable from "@/components/attendance/AttendanceTable";
import useSWR from "swr";

type AttendanceRecord = {
  date: string;
  studentName?: string;
  status: "present" | "absent" | "late";
};

export default function AttendanceReportPage() {
  const { data: records } = useSWR<{
    date: string;
    present: boolean;
    student: { name: string };
  }[]>("/api/attendance", (url: string) =>
    fetch(url).then((res) => res.json())
  );

  if (!records) return <p>Loading attendance...</p>;

  const totalDays = records.length;
  const presentDays = records.filter((r) => r.present).length;
  const percentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

  const tableRecords: AttendanceRecord[] = records.map((r) => ({
    date: r.date,
    studentName: r.student?.name,
    status: r.present ? "present" : "absent", // ✅ now typed correctly
  }));

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Attendance Report</h1>
      <AttendanceSummary
        totalDays={totalDays}
        presentDays={presentDays}
        percentage={percentage}
      />
      <div>
        <h2 className="text-2xl font-semibold mb-4">Recent Records</h2>
        <AttendanceTable records={tableRecords} />
      </div>
    </div>
  );
}
