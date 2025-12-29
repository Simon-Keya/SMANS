"use client";

import AttendanceMarker from "@/components/attendance/AttendanceMarker";
import { useRouter } from "next/navigation";
import { useState } from "react";

const mockStudents = [
  { id: "1", name: "John Doe", rollNumber: "001" },
  { id: "2", name: "Jane Smith", rollNumber: "002" },
  // Add more or fetch from API
];

export default function MarkAttendancePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (attendance: any[]) => {
    setIsLoading(true);
    // Call server action or API
    await fetch("/api/attendance", {
      method: "POST",
      body: JSON.stringify({ date: new Date().toISOString().split("T")[0], records: attendance }),
    });
    router.push("/dashboard/attendance");
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Mark Attendance</h1>
      <AttendanceMarker students={mockStudents} date={new Date().toLocaleDateString()} onSubmit={handleSubmit} />
    </div>
  );
}