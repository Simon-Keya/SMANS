"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { useForm } from "react-hook-form";

interface SubjectGrade {
  subject: string;
  marks: number;
  maxMarks: number;
}

interface GradeEntryFormProps {
  studentName: string;
  subjects: string[];
  onSubmit: (grades: SubjectGrade[]) => void;
}

export default function GradeEntryForm({ studentName, subjects, onSubmit }: GradeEntryFormProps) {
  const { register, handleSubmit, watch } = useForm();

  const onFormSubmit = (data: any) => {
    const grades = subjects.map((subject) => ({
      subject,
      marks: Number(data[subject] || 0),
      maxMarks: 100,
    }));
    onSubmit(grades);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Enter Grades for {studentName}</h3>
      </div>

      <div className="grid gap-4">
        {subjects.map((subject) => (
          <div key={subject} className="flex items-center gap-4">
            <Label htmlFor={subject} className="w-40">
              {subject}
            </Label>
            <Input
              id={subject}
              type="number"
              min="0"
              max="100"
              {...register(subject)}
              className="w-32"
              placeholder="0-100"
            />
            <span className="text-sm text-muted-foreground">/ 100</span>
          </div>
        ))}
      </div>

      <Button type="submit">Save Grades</Button>
    </form>
  );
}