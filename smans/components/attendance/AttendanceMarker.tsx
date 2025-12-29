"use client";

import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Label } from "@/components/ui/Label";
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

  const handleToggle = (studentId: string, checked: boolean) => {
    setAttendance((prev) => ({ ...prev, [studentId]: checked }));
  };

  const handleMarkAll = (present: boolean) => {
    const all = students.reduce((acc, s) => ({ ...acc, [s.id]: present }), {});
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
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Mark Attendance - {date}</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => handleMarkAll(true)}>
            All Present
          </Button>
          <Button variant="outline" size="sm" onClick={() => handle handleMarkAll(false)}>
            All Absent
          </Button>
        </div>
      </div>

      <div className="border rounded-lg">
        {students.map((student) => (
          <div key={student.id} className="flex items-center justify-between p-4 border-b last:border-b-0">
            <div>
              <p className="font-medium">{student.name}</p>
              <p className="text-sm text-muted-foreground">Roll: {student.rollNumber}</p>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id={student.id}
                checked={attendance[student.id] ?? true}
                onCheckedChange={(checked) => handleToggle(student.id, checked as boolean)}
              />
              <Label htmlFor={student.id}>{attendance[student.id] === false ? "Absent" : "Present"}</Label>
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