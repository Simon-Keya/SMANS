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
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

// Import server actions
import { createStudent } from "@/app/actions/students/createStudent";
import { updateStudent } from "@/app/actions/students/updateStudent";

const studentSchema = z.object({
  name: z.string().min(2, "Name is required"),
  admissionNumber: z.string().min(3, "Admission number is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  classId: z.string().min(1, "Please select a class"),
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
  const [isPending, startTransition] = useTransition();
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

  const handleFormSubmit = async (data: StudentFormData) => {
    setError(null);
    startTransition(async () => {
      try {
        if (isEdit && studentId) {
          // Update mode
          const updateData = {
            name: data.name,
            admissionNumber: data.admissionNumber,
            email: data.email || null,
            phone: data.phone || null,
            classId: data.classId,
            parentId: data.parentId || null,
          };
          await updateStudent(studentId, updateData);
          alert("Student updated successfully!");
        } else {
          // Create mode - use Prisma's nested create structure
          const createData = {
            name: data.name,
            admissionNumber: data.admissionNumber,
            email: data.email || null,
            phone: data.phone || null,
            class: {
              connect: { id: data.classId }
            },
            parent: data.parentId ? {
              connect: { id: data.parentId }
            } : undefined,
            user: {
              create: {
                email: data.email || `${data.admissionNumber}@school.com`,
                password: data.password || "default123",
                name: data.name,
                role: "STUDENT",
              }
            }
          };
          await createStudent(createData as any);
          alert("Student created successfully!");
        }

        if (onSuccess) {
          onSuccess();
        } else {
          router.push("/dashboard/students");
          router.refresh();
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Something went wrong. Please try again.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name *</Label>
          <Input id="name" {...register("name")} disabled={isPending} />
          {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="admissionNumber">Admission Number *</Label>
          <Input id="admissionNumber" {...register("admissionNumber")} disabled={isPending} />
          {errors.admissionNumber && <p className="text-sm text-red-500">{errors.admissionNumber.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="classId">Class *</Label>
          <Select 
            onValueChange={(value) => setValue("classId", value)} 
            defaultValue={watch("classId")}
            disabled={isPending}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a class" />
            </SelectTrigger>
            <SelectContent>
              {classes.length === 0 ? (
                <SelectItem value="" disabled>No classes available</SelectItem>
              ) : (
                classes.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.name} {cls.level ? `(${cls.level})` : ""}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {errors.classId && <p className="text-sm text-red-500">{errors.classId.message}</p>}
          {classes.length === 0 && !errors.classId && (
            <p className="text-sm text-yellow-600">No classes available. Please create a class first.</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="parentId">Parent (Optional)</Label>
          <Select 
            onValueChange={(value) => setValue("parentId", value)} 
            defaultValue={watch("parentId") || ""}
            disabled={isPending}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Parent" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">No Parent</SelectItem>
              {parents.map((parent) => (
                <SelectItem key={parent.id} value={parent.id}>
                  {parent.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email (Optional)</Label>
          <Input id="email" type="email" {...register("email")} disabled={isPending} />
          {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone (Optional)</Label>
          <Input id="phone" type="tel" {...register("phone")} disabled={isPending} />
        </div>

        {!isEdit && (
          <div className="space-y-2">
            <Label htmlFor="password">Initial Password *</Label>
            <Input id="password" type="password" {...register("password")} disabled={isPending} />
            {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
            <p className="text-xs text-gray-500">Student can change this after first login.</p>
          </div>
        )}
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={isPending} className="w-full md:w-auto">
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isEdit ? "Updating..." : "Creating Student..."}
            </>
          ) : (
            isEdit ? "Update Student" : "Create Student"
          )}
        </Button>
      </div>
    </form>
  );
}