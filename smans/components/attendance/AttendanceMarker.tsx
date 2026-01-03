"use client";

import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Label } from "@/components/ui/Label";
import { CheckedState } from "@radix-ui/react-checkbox";
import { useState } from "react";

export interface Student {
  id: string;
  name: string;
  rollNumber: string;
}

export interface AttendanceMarkerProps {
  students: Student[];
  date: string;
  isSubmitting?: boolean; // ✅ add this
  onSubmit: (attendance: { studentId: string; present: boolean }[]) => void;
}

export default function AttendanceMarker({
  students,
  date,
  onSubmit,
  isSubmitting = false,
}: AttendanceMarkerProps) {
  const [attendance, setAttendance] = useState<Record<string, boolean>>(
    () =>
      students.reduce((acc, s) => {
        acc[s.id] = true; // default present
        return acc;
      }, {} as Record<string, boolean>)
  );

  // Toggle single student
  const handleToggle = (studentId: string, checked: CheckedState) => {
    const isPresent = checked === true;
    setAttendance((prev) => ({ ...prev, [studentId]: isPresent }));
  };

  // Mark all present or absent
  const handleMarkAll = (present: boolean) => {
    const all = students.reduce((acc, s) => {
      acc[s.id] = present;
      return acc;
    }, {} as Record<string, boolean>);
    setAttendance(all);
  };

  // Submit attendance
  const handleSubmit = () => {
    const records = students.map((s) => ({
      studentId: s.id,
      present: attendance[s.id] ?? false,
    }));
    onSubmit(records);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="text-lg font-semibold">Mark Attendance - {date}</h3>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleMarkAll(true)}
            className="flex-1 sm:flex-initial"
            disabled={isSubmitting} // ✅ disable while submitting
          >
            All Present
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleMarkAll(false)}
            className="flex-1 sm:flex-initial"
            disabled={isSubmitting} // ✅ disable while submitting
          >
            All Absent
          </Button>
        </div>
      </div>

      {/* Student list */}
      <div className="border rounded-lg divide-y">
        {students.map((student) => (
          <div key={student.id} className="flex items-center justify-between p-4">
            <div>
              <p className="font-medium">{student.name}</p>
              <p className="text-sm text-muted-foreground">Roll: {student.rollNumber}</p>
            </div>
            <div className="flex items-center space-x-3">
              <Checkbox
                id={student.id}
                checked={attendance[student.id] ?? true}
                onCheckedChange={(checked) => handleToggle(student.id, checked)}
                disabled={isSubmitting} // ✅ disable checkbox while submitting
              />
              <Label htmlFor={student.id} className="cursor-pointer select-none">
                {attendance[student.id] === false ? "Absent" : "Present"}
              </Label>
            </div>
          </div>
        ))}
      </div>

      {/* Submit button */}
      <Button onClick={handleSubmit} className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : "Save Attendance"}
      </Button>
    </div>
  );
}
