// app/dashboard/students/students-client.tsx
"use client";

import { useState } from "react";
import StudentTable from "@/components/students/StudentTable";
import { Student } from "@/components/students/StudentTable";

interface StudentsClientProps {
  students: Student[];
  onDelete: (id: string) => Promise<void>;
}

export default function StudentsClient({ students, onDelete }: StudentsClientProps) {
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.admissionNumber.toLowerCase().includes(search.toLowerCase()) ||
      s.className.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await onDelete(id);
    } catch (err: any) {
      console.error("Delete failed:", err);
      alert(err.message || "Failed to delete student");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <input
          type="text"
          placeholder="Search students by name, admission number or class..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md p-2 border rounded bg-base-100"
        />
      </div>

      <StudentTable 
        students={filtered} 
        onDelete={handleDelete}
        deletingId={deletingId}
      />
    </div>
  );
}