// app/dashboard/grades/enter/GradeEntryClient.tsx
"use client";

import GradeEntryForm from "@/components/grades/GradeEntryForm";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface Props {
  examId: string;
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
  const { data: session, status } = useSession();
  const router = useRouter();

  // ✅ Check permission on client side too
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

  if (status === "loading") {
    return <p className="text-gray-500">Checking permissions...</p>;
  }

  return (
    <GradeEntryForm
      examId={examId}
      students={students}
      subjects={subjects}
      onSuccess={onSuccess}
    />
  );
}