"use client";

import AttendanceSummary from "@/components/attendance/AttendanceSummary";
import AttendanceTable from "@/components/attendance/AttendanceTable";
import useSWR from "swr";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

// Type for API response
type ApiAttendanceRecord = {
  id: string;
  date: string;
  status: string; // "PRESENT", "ABSENT", "LATE"
  student?: {
    name: string;
    admissionNumber: string;
  };
};

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch attendance");
    return res.json();
  });

export default function AttendanceReportPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // ✅ Redirect if not authenticated
  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/auth/login");
    }
  }, [session, status, router]);

  const { data, error, isLoading } = useSWR(
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

  // Handle different response formats
  const recordsData = data?.data || data || [];
  const records = Array.isArray(recordsData) ? recordsData : [];

  const totalDays = records.length;
  const presentDays = records.filter((r: any) => r.status === "PRESENT").length;
  const absentDays = records.filter((r: any) => r.status === "ABSENT").length;
  const lateDays = records.filter((r: any) => r.status === "LATE").length;
  const percentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

  // Map to AttendanceTable format
  const tableRecords = records.map((r: any) => ({
    date: r.date ? new Date(r.date).toLocaleDateString() : "—",
    studentName: r.student?.name || "—",
    status: r.status === "PRESENT" ? ("present" as const) : 
            r.status === "LATE" ? ("late" as const) : 
            ("absent" as const),
  }));

  return (
    <div className="space-y-8 p-6">
      <h1 className="text-3xl font-bold text-primary">Attendance Report</h1>

      <AttendanceSummary
        totalDays={totalDays}
        presentDays={presentDays}
        percentage={percentage}
      />

      {tableRecords.length > 0 ? (
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-primary">Recent Records</h2>
          <AttendanceTable records={tableRecords} />
        </div>
      ) : (
        <div className="text-center py-12 bg-base-200 rounded-lg">
          <p className="text-base-content/60">No attendance records found.</p>
        </div>
      )}
    </div>
  );
}