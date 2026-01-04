"use client";

import AttendanceSummary from "@/components/attendance/AttendanceSummary";
import AttendanceTable from "@/components/attendance/AttendanceTable";
import useSWR from "swr";

type AttendanceRecord = {
  date: string;
  studentName?: string;
  status: "present" | "absent" | "late";
};

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch attendance");
    return res.json();
  });

export default function AttendanceReportPage() {
  const { data, error, isLoading } = useSWR<
    {
      date: string;
      present: boolean;
      student?: { name: string };
    }[]
  >("/api/attendance", fetcher);

  if (isLoading) {
    return <p className="text-muted-foreground">Loading attendance...</p>;
  }

  if (error) {
    return <p className="text-red-500">Failed to load attendance</p>;
  }

  if (!data || data.length === 0) {
    return <p>No attendance records found</p>;
  }

  const totalDays = data.length;
  const presentDays = data.filter((r) => r.present).length;
  const percentage =
    totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

  const tableRecords: AttendanceRecord[] = data.map((r) => ({
    date: r.date,
    studentName: r.student?.name,
    status: r.present ? "present" : "absent",
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
