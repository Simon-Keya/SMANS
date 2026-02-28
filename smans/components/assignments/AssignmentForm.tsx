// components/AssignmentForm.tsx
"use client";

import { useZodForm } from "@/hooks/useForm";
import { useRouter } from "next/navigation";
import { z } from "zod";

const assignmentSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  dueDate: z.string().min(1, "Due date is required"),
  classId: z.string().min(1, "Class is required"),
  subjectId: z.string().min(1, "Subject is required"),
});

type AssignmentFormData = z.infer<typeof assignmentSchema>;

interface Props {
  initialData?: Partial<AssignmentFormData>;
  onSuccess?: () => void;
}

export default function AssignmentForm({ initialData, onSuccess }: Props) {
  const router = useRouter();

  const form = useZodForm(assignmentSchema, {
    defaultValues: initialData || {
      title: "",
      description: "",
      dueDate: new Date().toISOString().split("T")[0],
      classId: "",
      subjectId: "",
    },
  });

  const onSubmit = async (data: AssignmentFormData) => {
    try {
      const res = await fetch("/api/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to create assignment");

      form.reset();
      onSuccess?.();
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Failed to save assignment");
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className="block text-sm font-medium">Title</label>
        <input
          {...form.register("title")}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
        {form.formState.errors.title && (
          <p className="mt-1 text-sm text-red-600">{form.formState.errors.title.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium">Description</label>
        <textarea
          {...form.register("description")}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Due Date</label>
        <input
          type="date"
          {...form.register("dueDate")}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
        {form.formState.errors.dueDate && (
          <p className="mt-1 text-sm text-red-600">{form.formState.errors.dueDate.message}</p>
        )}
      </div>

      {/* Add classId & subjectId selects here in real app */}
      <button
        type="submit"
        disabled={form.formState.isSubmitting}
        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {form.formState.isSubmitting ? "Saving..." : "Save Assignment"}
      </button>
    </form>
  );
}