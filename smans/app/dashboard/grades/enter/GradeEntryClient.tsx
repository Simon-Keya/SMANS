"use client";

import GradeEntryForm from "@/components/grades/GradeEntryForm";

interface Props {
  studentName: string;
  subjects: string[];
}

export default function GradeEntryClient({ studentName, subjects }: Props) {
  const handleSubmit = async (grades: Record<string, number>) => {
    try {
      await fetch("/api/grades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName,
          grades,
        }),
      });

      alert("Grades saved successfully");
    } catch (error) {
      console.error(error);
      alert("Failed to save grades");
    }
  };

  return (
    <GradeEntryForm
      studentName={studentName}
      subjects={subjects}
      onSubmit={handleSubmit}
    />
  );
}
