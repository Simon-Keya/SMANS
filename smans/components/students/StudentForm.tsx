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
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const studentSchema = z.object({
  name: z.string().min(2, "Name is required"),
  admissionNumber: z.string().min(3, "Admission number is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  classId: z.string().min(1, "Class is required"),
  parentId: z.string().optional(),
  password: z.string().min(8, "Password must be at least 8 characters").optional(),
});

type StudentFormData = z.infer<typeof studentSchema>;

interface StudentFormProps {
  defaultValues?: Partial<StudentFormData>;
  isEdit?: boolean;
  studentId?: string;
  onSubmit?: (data: StudentFormData) => Promise<void>;
}

export default function StudentForm({
  defaultValues = {},
  isEdit = false,
  studentId,
  onSubmit,
}: StudentFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

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
    startTransition(async () => {
      try {
        if (isEdit && studentId && onSubmit) {
          await onSubmit(data);
        } else {
          // Create mode
          const res = await fetch("/api/students", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });

          if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || "Failed to create student");
          }

          alert("Student created successfully!");
          router.push("/dashboard/students");
          router.refresh();
        }
      } catch (err: any) {
        console.error(err);
        alert(err.message || "Something went wrong");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name *</Label>
          <Input id="name" {...register("name")} disabled={isPending} />
          {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="admissionNumber">Admission Number *</Label>
          <Input id="admissionNumber" {...register("admissionNumber")} disabled={isPending} />
          {errors.admissionNumber && <p className="text-sm text-destructive">{errors.admissionNumber.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="classId">Class *</Label>
          <Select onValueChange={(value) => setValue("classId", value)} defaultValue={watch("classId")} disabled={isPending}>
            <SelectTrigger>
              <SelectValue placeholder="Select Class" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 12 }, (_, i) => (
                <SelectItem key={i} value={`class-${i + 1}`}>
                  Class {i + 1}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.classId && <p className="text-sm text-destructive">{errors.classId.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email (Optional)</Label>
          <Input id="email" type="email" {...register("email")} disabled={isPending} />
          {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone (Optional)</Label>
          <Input id="phone" type="tel" {...register("phone")} disabled={isPending} />
        </div>

        {!isEdit && (
          <div className="space-y-2">
            <Label htmlFor="password">Initial Password *</Label>
            <Input id="password" type="password" {...register("password")} disabled={isPending} />
            {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
          </div>
        )}
      </div>

      <div className="flex justify-end">
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