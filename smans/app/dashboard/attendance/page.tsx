// app/dashboard/attendance/report/page.tsx
"use client";

import AttendanceSummary from "@/components/attendance/AttendanceSummary";
import AttendanceTable from "@/components/attendance/AttendanceTable";
import useSWR from "swr";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

type ApiAttendanceRecord = {
  date: string;
  present: boolean;
  student?: {
    name: string;
  };
};

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch attendance");
    return res.json() as Promise<ApiAttendanceRecord[]>;
  });

export default function AttendanceReportPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // ✅ All authenticated users can view reports
  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/auth/login");
    }
  }, [session, status, router]);

  const { data, error, isLoading } = useSWR<ApiAttendanceRecord[]>(
    session ? "/api/attendance" : null,
    fetcher
  );

  if (status === "loading" || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <p className="text-muted-foreground animate-pulse text-lg">
          Loading attendance data...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-error">
        <p className="text-lg font-medium">Failed to load attendance records</p>
        <p className="text-sm mt-2">Please try again later or contact support.</p>
      </div>
    );
  }

  const records = data || [];
  const totalDays = records.length;
  const presentDays = records.filter((r) => r.present).length;
  const percentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

  const tableRecords = records.map((r) => ({
    date: r.date,
    studentName: r.student?.name || "—",
    status: r.present ? ("present" as const) : ("absent" as const),
  }));

  return (
    <div className="space-y-8 p-6">
      <h1 className="text-3xl font-bold text-primary">Attendance Report</h1>

      <AttendanceSummary
        totalDays={totalDays}
        presentDays={presentDays}
        percentage={percentage}
      />

      <div>
        <h2 className="text-2xl font-semibold mb-4 text-primary">Recent Records</h2>
        <AttendanceTable records={tableRecords} />
      </div>
    </div>
  );
}