// components/students/StudentForm.tsx
"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const studentSchema = z.object({
  name: z.string().min(2, "Name is required"),
  admissionNumber: z.string().min(3, "Admission number is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  classId: z.string().optional(),
  parentId: z.string().optional(),
  password: z.string().min(8, "Password must be at least 8 characters").optional(),
});

type StudentFormData = z.infer<typeof studentSchema>;

interface StudentFormProps {
  defaultValues?: Partial<StudentFormData>;
  isEdit?: boolean;
  studentId?: string;
  classes: { id: string; name: string; level: string | null }[];
  parents: { id: string; name: string }[];
  onSuccess?: () => void;
}

export default function StudentForm({
  defaultValues = {},
  isEdit = false,
  studentId,
  classes = [],
  parents = [],
  onSuccess,
}: StudentFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      name: "",
      admissionNumber: "",
      email: "",
      phone: "",
      classId: "",
      parentId: "",
      password: "",
      ...defaultValues,
    },
  });

  const onSubmit = async (data: StudentFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      if (isEdit && studentId) {
        // UPDATE - Send PUT request
        const updateData = {
          name: data.name.trim(),
          admissionNumber: data.admissionNumber.trim(),
          email: data.email?.trim() || null,
          phone: data.phone?.trim() || null,
          classId: data.classId === "unassigned" ? null : data.classId || null,
          parentId: data.parentId === "no-parent" ? null : data.parentId || null,
        };

        console.log("📤 Sending PUT request to /api/students/" + studentId);
        console.log("📤 Data:", updateData);

        const response = await fetch(`/api/students/${studentId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updateData),
        });

        console.log("📥 Response status:", response.status);

        const result = await response.json();
        console.log("📥 Response data:", result);

        if (!response.ok) {
          throw new Error(result.error || "Failed to update student");
        }

        // Success - show message and redirect
        alert("✅ Student updated successfully!");
        
        if (onSuccess) {
          onSuccess();
        } else {
          router.push("/dashboard/students");
          router.refresh();
        }
      } else {
        // CREATE - Send POST request
        const createData = {
          name: data.name.trim(),
          admissionNumber: data.admissionNumber.trim(),
          email: data.email?.trim() || null,
          phone: data.phone?.trim() || null,
          classId: data.classId && data.classId !== "unassigned" ? data.classId : null,
          parentId: data.parentId && data.parentId !== "no-parent" ? data.parentId : null,
          password: data.password || "password123",
        };

        console.log("📤 Sending POST request to /api/students");
        console.log("📤 Data:", createData);

        const response = await fetch("/api/students", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(createData),
        });

        console.log("📥 Response status:", response.status);

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Failed to create student");
        }

        // Success - show message and redirect
        alert("✅ Student created successfully!");
        
        if (onSuccess) {
          onSuccess();
        } else {
          router.push("/dashboard/students");
          router.refresh();
        }
      }
    } catch (err: any) {
      console.error("❌ Form submission error:", err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Full Name *</Label>
          <Input id="name" {...register("name")} disabled={isSubmitting} />
          {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
        </div>

        {/* Admission Number */}
        <div className="space-y-2">
          <Label htmlFor="admissionNumber">Admission Number *</Label>
          <Input id="admissionNumber" {...register("admissionNumber")} disabled={isSubmitting} />
          {errors.admissionNumber && <p className="text-sm text-red-500">{errors.admissionNumber.message}</p>}
        </div>

        {/* Class */}
        <div className="space-y-2">
          <Label htmlFor="classId">
            Class <span className="text-xs text-base-content/50">(optional)</span>
          </Label>
          <Select 
            onValueChange={(value) => setValue("classId", value)} 
            value={watch("classId") || "unassigned"}
            disabled={isSubmitting}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unassigned">Not Assigned</SelectItem>
              {classes.map((cls) => (
                <SelectItem key={cls.id} value={cls.id}>
                  {cls.name} {cls.level ? `(${cls.level})` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Parent */}
        <div className="space-y-2">
          <Label htmlFor="parentId">Parent (Optional)</Label>
          <Select 
            onValueChange={(value) => setValue("parentId", value)} 
            value={watch("parentId") || "no-parent"}
            disabled={isSubmitting}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Parent" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="no-parent">No Parent</SelectItem>
              {parents.map((parent) => (
                <SelectItem key={parent.id} value={parent.id}>
                  {parent.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Email (Optional)</Label>
          <Input id="email" type="email" {...register("email")} disabled={isSubmitting} />
          {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="phone">Phone (Optional)</Label>
          <Input id="phone" type="tel" {...register("phone")} disabled={isSubmitting} />
        </div>

        {/* Password - only for create */}
        {!isEdit && (
          <div className="space-y-2">
            <Label htmlFor="password">Initial Password *</Label>
            <Input id="password" type="password" {...register("password")} disabled={isSubmitting} />
            {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
          </div>
        )}
      </div>

      <div className="flex justify-end pt-4">
        <Button 
          type="submit" 
          disabled={isSubmitting} 
          className="w-full md:w-auto min-w-[140px]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isEdit ? "Updating..." : "Creating..."}
            </>
          ) : (
            isEdit ? "Update Student" : "Create Student"
          )}
        </Button>
      </div>
    </form>
  );
}