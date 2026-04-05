// app/dashboard/grades/enter/GradeEntryClient.tsx
"use client";

import GradeEntryForm from "@/components/grades/GradeEntryForm";

interface Props {
  examId: string;                    // Required by GradeEntryForm
  students: Array<{ id: string; name: string; admissionNumber?: string }>;
  subjects: Array<{ id: string; name: string }>;
  onSuccess?: () => void;
}

export default function GradeEntryClient({ 
  examId, 
  students, 
  subjects, 
  onSuccess 
}: Props) {
  
  const handleSubmit = async (formData: any) => {
    try {
      // You can call your server action directly instead of fetch
      // await recordResults(formData);

      alert("Grades saved successfully!");
      onSuccess?.();
    } catch (error) {
      console.error(error);
      alert("Failed to save grades. Please try again.");
    }
  };

  return (
    <GradeEntryForm
      examId={examId}
      students={students}
      subjects={subjects}
      onSuccess={onSuccess}
    />
  );
}