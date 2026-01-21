// components/exams/ExamForm.tsx
"use client";

import { Button } from "@/components/ui/Button";
import { Calendar } from "@/components/ui/Calendar";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/Popover";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const examSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  subjectId: z.string().min(1, "Subject is required"),
  classId: z.string().min(1, "Class is required"),
  date: z.date(),
  duration: z.number().min(15, "Duration must be at least 15 minutes"),
  maxScore: z.number().min(1, "Max score must be greater than 0"),
});

type ExamFormData = z.infer<typeof examSchema>;

interface ExamFormProps {
  exam?: {
    id: string;
    title: string;
    subjectId: string;
    classId: string;
    date: Date;
    duration: number;
    maxScore: number;
  };
}

export default function ExamForm({ exam }: ExamFormProps = {}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEdit = !!exam;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ExamFormData>({
    resolver: zodResolver(examSchema),
    defaultValues: exam
      ? {
          title: exam.title,
          subjectId: exam.subjectId,
          classId: exam.classId,
          date: exam.date,
          duration: exam.duration,
          maxScore: exam.maxScore,
        }
      : {
          title: "",
          subjectId: "",
          classId: "",
          date: new Date(),
          duration: 120,
          maxScore: 100,
        },
  });

  const selectedDate = watch("date");

  const onSubmit = async (data: ExamFormData) => {
    startTransition(async () => {
      try {
        const res = await fetch(isEdit ? `/api/exams/${exam?.id}` : "/api/exams", {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (!res.ok) throw new Error("Failed to save exam");

        router.push("/dashboard/exams");
        router.refresh();
      } catch (err) {
        console.error(err);
        alert("Failed to save exam. Please try again.");
      }
    });
  };

  return (
    <Card className="bg-base-100 shadow-lg border-base-200">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Exam Title *</Label>
              <Input id="title" placeholder="Mid-Term Exam - Mathematics" {...register("title")} />
              {errors.title && <p className="text-sm text-error">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="subjectId">Subject *</Label>
              <Input id="subjectId" placeholder="Subject ID or name" {...register("subjectId")} />
              {errors.subjectId && <p className="text-sm text-error">{errors.subjectId.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="classId">Class/Group *</Label>
              <Input id="classId" placeholder="Class ID or name" {...register("classId")} />
              {errors.classId && <p className="text-sm text-error">{errors.classId.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(day) => setValue("date", day ?? new Date())}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.date && <p className="text-sm text-error">{errors.date.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes) *</Label>
              <Input
                id="duration"
                type="number"
                {...register("duration", { valueAsNumber: true })}
              />
              {errors.duration && <p className="text-sm text-error">{errors.duration.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxScore">Maximum Score *</Label>
              <Input
                id="maxScore"
                type="number"
                {...register("maxScore", { valueAsNumber: true })}
              />
              {errors.maxScore && <p className="text-sm text-error">{errors.maxScore.message}</p>}
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
                "Update Exam"
              ) : (
                "Schedule Exam"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}