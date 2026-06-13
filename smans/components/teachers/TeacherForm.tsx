"use client";

import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const teacherSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").trim(),
  email: z.string().email("Invalid email").trim().toLowerCase(),
  phone: z.string().optional(),
  staffNo: z.string().min(1, "Staff number is required").trim(),
  password: z.string().min(8, "Password must be at least 8 characters").optional(),
});

type TeacherFormData = z.infer<typeof teacherSchema> & { id?: string };

interface TeacherFormProps {
  teacher?: {
    id: string;
    name: string | null;
    email: string;
    phone?: string | null;
    staffNo?: string | null;
  };
  onSuccess?: () => void;
}

export default function TeacherForm({ teacher, onSuccess }: TeacherFormProps = {}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEdit = !!teacher;

  const formSchema = isEdit
    ? teacherSchema.omit({ password: true }) // Don't require password on edit
    : teacherSchema;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TeacherFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: teacher?.name ?? "",
      email: teacher?.email ?? "",
      phone: teacher?.phone ?? "",
      staffNo: teacher?.staffNo ?? "",
      password: "",
    },
  });

  const onSubmit = async (data: TeacherFormData) => {
    startTransition(async () => {
      try {
        let res: Response;

        if (isEdit && teacher?.id) {
          // Update - remove password
          const { password, ...updateData } = data;
          res = await fetch(`/api/teachers/${teacher.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updateData),
          });
        } else {
          // Create
          res = await fetch("/api/teachers", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });
        }

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to save teacher");
        }

        alert(isEdit ? "Teacher updated successfully!" : "Teacher created successfully!");

        router.push("/dashboard/teachers");
        router.refresh();
        onSuccess?.();
        reset();
      } catch (err: any) {
        console.error("Teacher save error:", err);
        alert(err.message || "Failed to save teacher. Please try again.");
      }
    });
  };

  return (
    <Card className="border-base-200 shadow-sm">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                placeholder="John Doe"
                {...register("name")}
                className={errors.name ? "border-destructive" : ""}
                disabled={isPending}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="staffNo">Staff Number {isEdit ? "(Optional)" : "*"}</Label>
              <Input
                id="staffNo"
                placeholder="TCH-001"
                {...register("staffNo")}
                className={errors.staffNo ? "border-destructive" : ""}
                disabled={isPending}
              />
              {errors.staffNo && <p className="text-sm text-destructive">{errors.staffNo.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                placeholder="teacher@smans.ac.ke"
                {...register("email")}
                className={errors.email ? "border-destructive" : ""}
                disabled={isPending}
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number (Optional)</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+254 712 345 678"
                {...register("phone")}
                disabled={isPending}
              />
              {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
            </div>

            {!isEdit && (
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="password">Initial Password *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Minimum 8 characters"
                  {...register("password")}
                  className={errors.password ? "border-destructive" : ""}
                  disabled={isPending}
                />
                {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isPending}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : isEdit ? (
                "Update Teacher"
              ) : (
                "Create Teacher"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}