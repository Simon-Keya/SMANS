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
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  class: z.string().min(1, "Class is required"),
  rollNumber: z.string().min(1, "Roll number required"),
  parentName: z.string().optional(),
  parentPhone: z.string().optional(),
});

type StudentFormData = z.infer<typeof studentSchema>;

interface StudentFormProps {
  defaultValues?: Partial<StudentFormData>;
  onSubmit: (data: StudentFormData) => Promise<void>;
  isLoading?: boolean;
}

export default function StudentForm({ defaultValues, onSubmit, isLoading }: StudentFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" {...register("name")} />
          {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <Label htmlFor="rollNumber">Roll Number</Label>
          <Input id="rollNumber" {...register("rollNumber")} />
          {errors.rollNumber && <p className="text-sm text-destructive mt-1">{errors.rollNumber.message}</p>}
        </div>

        <div>
          <Label htmlFor="class">Class</Label>
          <Select onValueChange={(value) => setValue("class", value)} defaultValue={watch("class")}>
            <SelectTrigger>
              <SelectValue placeholder="Select class" />
            </SelectTrigger>
            <SelectContent>
              {["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"].map((c) => (
                <SelectItem key={c} value={c}>
                  Class {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.class && <p className="text-sm text-destructive mt-1">{errors.class.message}</p>}
        </div>

        <div>
          <Label htmlFor="email">Email (Optional)</Label>
          <Input id="email" type="email" {...register("email")} />
        </div>

        <div>
          <Label htmlFor="parentName">Parent Name</Label>
          <Input id="parentName" {...register("parentName")} />
        </div>

        <div>
          <Label htmlFor="parentPhone">Parent Phone</Label>
          <Input id="parentPhone" {...register("parentPhone")} />
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