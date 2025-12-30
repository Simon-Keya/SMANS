"use client";

import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Label } from "@/components/ui/Label";
import { CheckedState } from "@radix-ui/react-checkbox"; // Import the type
import { useState } from "react";

interface Student {
  id: string;
  name: string;
  rollNumber: string;
}

interface AttendanceMarkerProps {
  students: Student[];
  date: string;
  onSubmit: (attendance: { studentId: string; present: boolean }[]) => void;
}

export default function AttendanceMarker({ students, date, onSubmit }: AttendanceMarkerProps) {
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});

  const handleToggle = (studentId: string, checked: CheckedState) => {
    // Convert "indeterminate" or boolean to boolean
    const isPresent = checked === true;
    setAttendance((prev) => ({ ...prev, [studentId]: isPresent }));
  };

  const handleMarkAll = (present: boolean) => {
    const all = students.reduce((acc, s) => ({ ...acc, [s.id]: present }), {} as Record<string, boolean>);
    setAttendance(all);
  };

  const handleSubmit = () => {
    const records = students.map((s) => ({
      studentId: s.id,
      present: attendance[s.id] ?? false,
    }));
    onSubmit(records);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="text-lg font-semibold">Mark Attendance - {date}</h3>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" onClick={() => handleMarkAll(true)} className="flex-1 sm:flex-initial">
            All Present
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleMarkAll(false)} className="flex-1 sm:flex-initial">
            All Absent
          </Button>
        </div>
      </div>

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
              />
              <Label htmlFor={student.id} className="cursor-pointer select-none">
                {attendance[student.id] === false ? "Absent" : "Present"}
              </Label>
            </div>
          </div>
        ))}
      </div>

      <Button onClick={handleSubmit} className="w-full">
        Save Attendance
      </Button>
    </div>
  );
}