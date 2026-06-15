// components/classes/ClassForm.tsx
"use client";

import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";

interface ClassFormProps {
  classData?: {
    id: string;
    name: string;
    level: string;
    teacherId?: string | null;
  };
  teachers: { id: string; name: string | null }[];
}

export default function ClassForm({ classData, teachers = [] }: ClassFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEdit = !!classData;

  const form = useForm({
    defaultValues: classData
      ? {
          name: classData.name,
          level: classData.level,
          teacherId: classData.teacherId ?? "",
        }
      : { name: "", level: "", teacherId: "" },
  });

  const { register, handleSubmit, setValue, watch } = form;
  const selectedTeacherId = watch("teacherId");

  const onSubmit = async (data: any) => {
    startTransition(async () => {
      try {
        const payload = {
          name: data.name,
          level: data.level,
          teacherId: data.teacherId && data.teacherId !== "none" ? data.teacherId : null,
        };

        const res = await fetch(
          isEdit ? `/api/classes/${classData?.id}` : "/api/classes",
          {
            method: isEdit ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );

        const result = await res.json();

        if (!res.ok) {
          throw new Error(result.error || "Failed to save class");
        }

        router.push("/dashboard/classes");
        router.refresh();
      } catch (err: any) {
        console.error(err);
        alert(err.message || "Failed to save class");
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
                placeholder="e.g. Grade 7B"
                {...register("name")}
                disabled={isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="level">Level/Grade *</Label>
              <Input
                id="level"
                placeholder="e.g. Grade 7, PP2, Class 8"
                {...register("level")}
                disabled={isPending}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Class Teacher (optional)</Label>
              <Select 
                onValueChange={(value) => setValue("teacherId", value)}
                value={selectedTeacherId || "none"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select teacher" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No teacher assigned</SelectItem>
                  {teachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.name || "Unnamed Teacher"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
            <Button type="submit" disabled={isPending}>
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