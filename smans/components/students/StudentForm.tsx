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
import { useForm } from "react-hook-form";
import * as z from "zod";

const studentSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().min(9, "Phone too short").optional(),
  class: z.string().min(1, "Class is required"),
  admissionNumber: z.string().min(1, "Admission number is required"),
  parentId: z.string().optional(),
});

type StudentFormData = z.infer<typeof studentSchema>;

interface StudentFormProps {
  defaultValues?: Partial<StudentFormData>;
  onSubmit: (data: StudentFormData) => Promise<void>;
  isLoading?: boolean;
  classes?: { id: string; name: string }[];
}

export default function StudentForm({
  defaultValues,
  onSubmit,
  isLoading = false,
  classes = [],
}: StudentFormProps) {
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
      email: "",
      phone: "",
      class: "",
      admissionNumber: "",
      parentId: "",
      ...defaultValues,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Full Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Full Name *</Label>
          <Input id="name" {...register("name")} disabled={isLoading} />
          {errors.name && (
            <p className="text-sm text-error">{errors.name.message}</p>
          )}
        </div>

        {/* Admission Number */}
        <div className="space-y-2">
          <Label htmlFor="admissionNumber">Admission Number *</Label>
          <Input
            id="admissionNumber"
            {...register("admissionNumber")}
            disabled={isLoading}
          />
          {errors.admissionNumber && (
            <p className="text-sm text-error">{errors.admissionNumber.message}</p>
          )}
        </div>

        {/* Class */}
        <div className="space-y-2">
          <Label htmlFor="class">Class *</Label>
          <Select
            onValueChange={(value) => setValue("class", value)}
            defaultValue={watch("class")}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select class" />
            </SelectTrigger>
            <SelectContent>
              {classes.length > 0 ? (
                classes.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))
              ) : (
                Array.from({ length: 12 }, (_, i) => i + 1).map((c) => (
                  <SelectItem key={c} value={`class-${c}`}>
                    Class {c}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {errors.class && (
            <p className="text-sm text-error">{errors.class.message}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Email (Optional)</Label>
          <Input
            id="email"
            type="email"
            {...register("email")}
            disabled={isLoading}
          />
          {errors.email && (
            <p className="text-sm text-error">{errors.email.message}</p>
          )}
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number (Optional)</Label>
          <Input
            id="phone"
            type="tel"
            {...register("phone")}
            disabled={isLoading}
          />
          {errors.phone && (
            <p className="text-sm text-error">{errors.phone.message}</p>
          )}
        </div>

        {/* Parent ID */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="parentId">Parent ID (Optional – link later)</Label>
          <Input id="parentId" {...register("parentId")} disabled={isLoading} />
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-primary hover:bg-primary-focus text-primary-content"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="loading loading-spinner loading-sm" />
              Saving...
            </span>
          ) : (
            "Save Student"
          )}
        </Button>
      </div>
    </form>
  );
}