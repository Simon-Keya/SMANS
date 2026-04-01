"use client";

import { Button } from "@/components/ui/Button";
import { Calendar } from "@/components/ui/Calendar";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/Popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const assessmentSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  learningAreaId: z.string().min(1, "Learning Area is required"),
  classId: z.string().min(1, "Class is required"),
  date: z.date(),
  duration: z.number().min(15, "Duration must be at least 15 minutes"),
  maxScore: z.number().min(1, "Max score must be greater than 0"),
  assessmentType: z.enum(["FORMATIVE", "SUMMATIVE", "CBC_CHECK"]),
});

type AssessmentFormData = z.infer<typeof assessmentSchema>;

interface AssessmentFormProps {
  assessment?: {
    id: string;
    title: string;
    learningAreaId: string;
    classId: string;
    date: Date;
    duration: number;
    maxScore: number;
    assessmentType?: "FORMATIVE" | "SUMMATIVE" | "CBC_CHECK";
  };
}

export default function AssessmentForm({ assessment }: AssessmentFormProps = {}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEdit = !!assessment;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AssessmentFormData>({
    resolver: zodResolver(assessmentSchema),
    defaultValues: assessment
      ? {
          title: assessment.title,
          learningAreaId: assessment.learningAreaId,
          classId: assessment.classId,
          date: assessment.date,
          duration: assessment.duration,
          maxScore: assessment.maxScore,
          assessmentType: assessment.assessmentType || "SUMMATIVE",
        }
      : {
          title: "",
          learningAreaId: "",
          classId: "",
          date: new Date(),
          duration: 120,
          maxScore: 100,
          assessmentType: "SUMMATIVE",
        },
  });

  const selectedDate = watch("date");

  const onSubmit = async (data: AssessmentFormData) => {
    startTransition(async () => {
      try {
        const res = await fetch(
          isEdit ? `/api/assessments/${assessment?.id}` : "/api/assessments",
          {
            method: isEdit ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          }
        );

        if (!res.ok) throw new Error("Failed to save assessment");

        router.push("/dashboard/assessments");
        router.refresh();
      } catch (err) {
        console.error(err);
        alert("Failed to save assessment. Please try again.");
      }
    });
  };

  return (
    <Card className="bg-base-100 shadow-lg border-base-200">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="title">Assessment Title *</Label>
              <Input 
                id="title" 
                placeholder="End of Term CBC Assessment - Mathematics" 
                {...register("title")} 
              />
              {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="learningAreaId">Learning Area *</Label>
              <Input 
                id="learningAreaId" 
                placeholder="e.g., Mathematics Activities" 
                {...register("learningAreaId")} 
              />
              {errors.learningAreaId && <p className="text-sm text-destructive">{errors.learningAreaId.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="classId">Class/Group *</Label>
              <Input 
                id="classId" 
                placeholder="Grade 4A" 
                {...register("classId")} 
              />
              {errors.classId && <p className="text-sm text-destructive">{errors.classId.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="assessmentType">Assessment Type *</Label>
              <Select 
                onValueChange={(value) => setValue("assessmentType", value as "FORMATIVE" | "SUMMATIVE" | "CBC_CHECK")} 
                defaultValue={watch("assessmentType")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FORMATIVE">Formative Assessment</SelectItem>
                  <SelectItem value="SUMMATIVE">Summative Assessment</SelectItem>
                  <SelectItem value="CBC_CHECK">CBC Progress Check</SelectItem>
                </SelectContent>
              </Select>
              {errors.assessmentType && <p className="text-sm text-destructive">{errors.assessmentType.message}</p>}
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
                    onSelect={(day: Date | undefined) => setValue("date", day || new Date())}  // ← FIXED: explicit type
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes) *</Label>
              <Input
                id="duration"
                type="number"
                {...register("duration", { valueAsNumber: true })}
              />
              {errors.duration && <p className="text-sm text-destructive">{errors.duration.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxScore">Maximum Score *</Label>
              <Input
                id="maxScore"
                type="number"
                {...register("maxScore", { valueAsNumber: true })}
              />
              {errors.maxScore && <p className="text-sm text-destructive">{errors.maxScore.message}</p>}
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
                "Update Assessment"
              ) : (
                "Schedule Assessment"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}