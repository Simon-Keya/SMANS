// app/dashboard/attendance/mark/page.tsx
"use client";

import AttendanceMarker from "@/components/attendance/AttendanceMarker";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

type Student = {
  id: string;
  name: string;
  admissionNumber: string; // Changed from rollNumber
};

type AttendanceRecord = {
  studentId: string;
  present: boolean;
};

export default function MarkAttendancePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if user has permission to mark attendance
  useEffect(() => {
    if (status === "loading") return;
    
    if (!session) {
      router.push("/auth/login");
      return;
    }

    const userRole = session.user?.role;
    if (!["ADMIN", "TEACHER"].includes(userRole)) {
      router.push("/dashboard");
      return;
    }
  }, [session, status, router]);

  // Fetch students from API
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch("/api/students");
        if (!res.ok) throw new Error("Failed to fetch students");
        const data: Student[] = await res.json();
        setStudents(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Error fetching students");
      }
    };

    fetchStudents();
  }, []);

  const handleSubmit = async (attendance: AttendanceRecord[]) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: new Date().toISOString().split("T")[0],
          records: attendance,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to submit attendance");
      }

      router.push("/dashboard/attendance");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Submission failed");
      setIsLoading(false);
    }
  };

  if (status === "loading") {
    return <p className="text-gray-500">Checking permissions...</p>;
  }

  if (error) {
    return <p className="text-red-500 font-semibold">{error}</p>;
  }

  if (!students.length) {
    return <p className="text-gray-500">Loading students...</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold mb-6">Mark Attendance</h1>

      <AttendanceMarker
        students={students}
        date={new Date().toLocaleDateString()}
        onSubmit={handleSubmit}
        isSubmitting={isLoading}
      />
    </div>
  );
}