"use client";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useState } from "react";

type GradeValue = number | "";

interface GradeEntryFormProps {
  studentName: string;
  subjects: string[];
  onSubmit: (grades: Record<string, number>) => void | Promise<void>;
}

export default function GradeEntryForm({
  studentName,
  subjects,
  onSubmit,
}: GradeEntryFormProps) {
  const [grades, setGrades] = useState<Record<string, GradeValue>>(
    () =>
      subjects.reduce((acc, subject) => {
        acc[subject] = "";
        return acc;
      }, {} as Record<string, GradeValue>)
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (subject: string, value: string) => {
    const numericValue = value === "" ? "" : Number(value);

    if (numericValue !== "" && (numericValue < 0 || numericValue > 100)) {
      return;
    }

    setGrades((prev) => ({
      ...prev,
      [subject]: numericValue,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formattedGrades: Record<string, number> = {};

    for (const subject of subjects) {
      const value = grades[subject];
      if (value === "") {
        alert(`Please enter a grade for ${subject}`);
        return;
      }
      formattedGrades[subject] = value;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(formattedGrades);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Grades for {studentName}</CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {subjects.map((subject) => (
            <div key={subject} className="flex items-center gap-4">
              <label className="w-1/3 font-medium">{subject}</label>
              <Input
                type="number"
                min={0}
                max={100}
                placeholder="0 – 100"
                value={grades[subject]}
                onChange={(e) => handleChange(subject, e.target.value)}
                required
              />
            </div>
          ))}

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving Grades..." : "Submit Grades"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
