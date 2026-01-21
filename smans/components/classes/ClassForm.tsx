// components/classes/ClassForm.tsx
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

const classSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").trim(),
  level: z.string().min(1, "Level/Grade is required"),
  teacherId: z.string().optional(),
});

type ClassFormData = z.infer<typeof classSchema>;

interface ClassFormProps {
  classData?: {
    id: string;
    name: string;
    level: string;
    teacherId?: string | null;
  };
}

export default function ClassForm({ classData }: ClassFormProps = {}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEdit = !!classData;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClassFormData>({
    resolver: zodResolver(classSchema),
    defaultValues: classData
      ? {
          name: classData.name,
          level: classData.level,
          teacherId: classData.teacherId ?? "",
        }
      : {
          name: "",
          level: "",
          teacherId: "",
        },
  });

  const onSubmit = async (data: ClassFormData) => {
    startTransition(async () => {
      try {
        const res = await fetch(isEdit ? `/api/classes/${classData?.id}` : "/api/classes", {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (!res.ok) throw new Error("Failed to save class");

        router.push("/dashboard/classes");
        router.refresh();
      } catch (err) {
        console.error(err);
        alert("Failed to save class");
      }
    });
  };

  return (
    <Card className="bg-base-100 shadow-lg border-base-200">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Class Name *</Label>
              <Input
                id="name"
                placeholder="e.g. Form 1A, Grade 7B"
                {...register("name")}
                disabled={isPending}
              />
              {errors.name && <p className="text-sm text-error">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="level">Level/Grade *</Label>
              <Input
                id="level"
                placeholder="e.g. Form 1, Grade 7"
                {...register("level")}
                disabled={isPending}
              />
              {errors.level && <p className="text-sm text-error">{errors.level.message}</p>}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="teacherId">Class Teacher (optional)</Label>
              <Input
                id="teacherId"
                placeholder="Teacher ID or name"
                {...register("teacherId")}
                disabled={isPending}
              />
            </div>
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

            <Button type="submit" className="btn-primary" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : isEdit ? (
                "Update Class"
              ) : (
                "Create Class"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}