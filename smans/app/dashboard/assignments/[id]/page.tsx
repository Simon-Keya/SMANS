// app/dashboard/assignments/[id]/page.tsx
"use client";

import AssignmentForm from "@/components/assignments/AssignmentForm";
import { useRole } from "@/hooks/useRole";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface Assignment {
  id: string;
  title: string;
  description?: string | null;
  dueDate: string;
  classId: string;
  subjectId: string;
  createdByUser?: { name: string } | null;
  subject?: { name: string; code: string };
  class?: { name: string };
}

export default function AssignmentDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { isTeacher, isAdmin, isLoading: roleLoading } = useRole();

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ Check permission on mount
  useEffect(() => {
    if (!roleLoading && !(isTeacher || isAdmin)) {
      toast.error("You don't have permission to view this assignment");
      router.push("/dashboard/assignments");
    }
  }, [roleLoading, isTeacher, isAdmin, router]);

  // Fetch assignment details
  useEffect(() => {
    if (!id || (!isTeacher && !isAdmin && !roleLoading)) return;

    const fetchAssignment = async () => {
      try {
        const res = await fetch(`/api/assignments/${id}`);
        if (!res.ok) {
          if (res.status === 404) throw new Error("Assignment not found");
          throw new Error("Failed to load assignment");
        }
        const data = await res.json();
        setAssignment(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        toast.error("Failed to load assignment");
      } finally {
        setLoading(false);
      }
    };

    fetchAssignment();
  }, [id, isTeacher, isAdmin, roleLoading]);

  if (roleLoading || loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-pulse">Loading assignment...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-red-600">
        <p className="font-medium">Error loading assignment</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="p-6 text-center text-gray-500">
        Assignment not found
      </div>
    );
  }

  // ✅ Only ADMIN and TEACHER can edit
  const canEdit = isTeacher || isAdmin;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-primary">Edit Assignment</h1>
          {assignment.class && (
            <p className="text-muted-foreground mt-1">
              {assignment.subject?.name} • {assignment.class.name}
            </p>
          )}
        </div>
        <button
          onClick={() => router.back()}
          className="text-gray-600 hover:text-gray-900 transition-colors"
        >
          ← Back to list
        </button>
      </div>

      {canEdit ? (
        <AssignmentForm
          initialData={{
            title: assignment.title,
            description: assignment.description || "",
            dueDate: new Date(assignment.dueDate).toISOString().split("T")[0],
            classId: assignment.classId,
            subjectId: assignment.subjectId,
          }}
          onSuccess={() => {
            toast.success("Assignment updated successfully!");
            router.push("/dashboard/assignments");
          }}
        />
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <p className="text-yellow-700">
            You have view-only access to this assignment.
          </p>
        </div>
      )}
    </div>
  );
}