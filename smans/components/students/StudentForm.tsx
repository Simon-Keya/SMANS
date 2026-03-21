"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

const studentSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().min(9, "Phone too short").optional(),
  class: z.string().min(1, "Class is required"),
  rollNumber: z.string().min(1, "Roll number is required"),
  parentId: z.string().optional(), // optional – can link later
});

type StudentFormData = z.infer<typeof studentSchema>;

interface StudentFormProps {
  defaultValues?: Partial<StudentFormData>;
  onSubmit: (data: StudentFormData) => Promise<void>;
  isLoading?: boolean;
  classes?: { id: string; name: string }[]; // pass real classes from parent component
}

export default function StudentForm({
  defaultValues,
  onSubmit,
  isLoading = false,
  classes = [], // fallback
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
      rollNumber: "",
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
          {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
        </div>

        {/* Roll Number */}
        <div className="space-y-2">
          <Label htmlFor="rollNumber">Roll Number *</Label>
          <Input id="rollNumber" {...register("rollNumber")} disabled={isLoading} />
          {errors.rollNumber && <p className="text-sm text-destructive">{errors.rollNumber.message}</p>}
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
                // Fallback – replace with real data fetch in parent component
                Array.from({ length: 12 }, (_, i) => i + 1).map((c) => (
                  <SelectItem key={c} value={`class-${c}`}>
                    Class {c}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {errors.class && <p className="text-sm text-destructive">{errors.class.message}</p>}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Email (Optional)</Label>
          <Input id="email" type="email" {...register("email")} disabled={isLoading} />
          {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number (Optional)</Label>
          <Input id="phone" type="tel" {...register("phone")} disabled={isLoading} />
          {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
        </div>

        {/* Parent ID (optional – link later) */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="parentId">Parent ID (Optional – link later)</Label>
          <Input id="parentId" {...register("parentId")} disabled={isLoading} />
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Student"}
        </Button>
      </div>
    </form>
  );
}