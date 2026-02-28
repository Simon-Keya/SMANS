// app/dashboard/students/students-client.tsx
"use client";

import { useState } from "react";

type Student = {
  id: string;
  name: string;
  rollNumber: string;
  className: string;
  email?: string;
  studentPhone?: string;
  parentPhone?: string;
};

interface Props {
  students: Student[];
}

export default function StudentsClient({ students }: Props) {
  const [search, setSearch] = useState("");

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.rollNumber.toLowerCase().includes(search.toLowerCase()) ||
      s.className.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <input
        type="text"
        placeholder="Search students..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-md p-2 border rounded"
      />

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Roll No</th>
              <th className="p-3 text-left">Class</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Parent Phone</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((student) => (
              <tr key={student.id} className="border-b hover:bg-gray-50">
                <td className="p-3">{student.name}</td>
                <td className="p-3">{student.rollNumber}</td>
                <td className="p-3">{student.className}</td>
                <td className="p-3">{student.email || "-"}</td>
                <td className="p-3">{student.parentPhone || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-gray-500 py-8">No students found</p>
      )}
    </div>
  );
}