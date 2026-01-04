"use client";

import StudentTable, { Student } from "@/components/students/StudentTable";
import { useRouter } from "next/navigation";

interface Props {
  students: Student[];
}

export default function StudentsClient({ students }: Props) {
  const router = useRouter();

  const handleEdit = (student: Student) => {
    router.push(`/dashboard/students/${student.id}`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this student?")) return;

    const res = await fetch(`/api/students/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      alert("Failed to delete student");
      return;
    }

    router.refresh();
  };

  return (
    <StudentTable
      students={students}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  );
}
