// app/(dashboard)/assignments/create/page.tsx
"use client";

import AssignmentForm from "@/components/assignments/AssignmentForm";
import { useRole } from "@/hooks/useRole";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import toast from "react-hot-toast";

export default function CreateAssignmentPage() {
  const { isTeacher, isAdmin, isLoading } = useRole();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !(isTeacher || isAdmin)) {
      toast.error("You don't have permission to create assignments");
      router.push("/dashboard/assignments");
    }
  }, [isLoading, isTeacher, isAdmin, router]);

  if (isLoading) return <div>Loading...</div>;

  if (!(isTeacher || isAdmin)) return null;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Create New Assignment</h1>
      
      <AssignmentForm 
        onSuccess={() => {
          toast.success("Assignment created successfully!");
          router.push("/dashboard/assignments");
        }}
      />
    </div>
  );
}