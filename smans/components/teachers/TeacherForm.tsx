"use client";

import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import * as z from "zod";

const teacherSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  // password only for new teacher
  password: z.string().min(8, "Password must be at least 8 characters").optional(),
});

type TeacherFormData = z.infer<typeof teacherSchema> & { id?: string };

interface TeacherFormProps {
  teacher?: { id: string; name: string; email: string };
}

export default function TeacherForm({ teacher }: TeacherFormProps = {}) {
  const router = useRouter();
  const isEdit = !!teacher;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TeacherFormData>({
    resolver: zodResolver(teacherSchema),
    defaultValues: teacher
      ? { name: teacher.name, email: teacher.email }
      : { name: "", email: "", password: "" },
  });

  const onSubmit = async (data: TeacherFormData) => {
    try {
      if (isEdit) {
        // Update teacher (you can create updateTeacher action)
        await fetch(`/api/teachers/${teacher?.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      } else {
        // Create new teacher
        await fetch("/api/teachers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      }

      router.push("/dashboard/teachers");
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Failed to save teacher");
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" {...register("name")} />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>

            {!isEdit && (
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="password">Initial Password</Label>
                <Input id="password" type="password" {...register("password")} />
                {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : isEdit ? "Update Teacher" : "Create Teacher"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}