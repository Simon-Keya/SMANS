// app/dashboard/exams/[id]/record-results/page.tsx
"use client";

import { recordResults } from "@/app/actions/exams/recordResults";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Toast, ToastDescription, ToastTitle } from "@/components/ui/Toast"; // Correct import
import { useRouter } from "next/navigation";
import { useState } from "react";

const assessmentTypes = [
  "TEST", "PROJECT", "PRACTICAL", "OBSERVATION", 
  "ORAL", "PORTFOLIO", "GROUP_WORK", "ASSIGNMENT"
];

const competencyLevels = [
  "EXCEEDING_EXPECTATIONS",
  "MEETING_EXPECTATIONS",
  "APPROACHING_EXPECTATIONS",
  "BELOW_EXPECTATIONS"
];

export default function RecordResultsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // TODO: In production, fetch real students and subjects for this exam/class
  const students = [
    { id: "stu1", name: "John Doe" },
    { id: "stu2", name: "Jane Smith" },
  ];

  const subjects = [
    { id: "sub1", name: "Mathematics" },
    { id: "sub2", name: "English" },
  ];

  const addResultRow = () => {
    setResults([...results, {
      studentId: "",
      subjectId: "",
      marks: 0,
      assessmentType: "TEST",
      competencyLevel: "",
      remarks: "",
    }]);
  };

  const updateResult = (index: number, field: string, value: any) => {
    const newResults = [...results];
    newResults[index] = { ...newResults[index], [field]: value };
    setResults(newResults);
  };

  const handleSubmit = async () => {
    if (results.length === 0) {
      alert("Please add at least one result");
      return;
    }

    setLoading(true);

    try {
      await recordResults({
        examId: params.id,
        term: "TERM_2", // Make this dynamic later
        results,
      });

      // Correct toast usage with ToastTitle and ToastDescription
      <Toast>
        <ToastTitle>Success</ToastTitle>
        <ToastDescription>CBC results recorded successfully.</ToastDescription>
      </Toast>;

      router.push(`/dashboard/exams/${params.id}`);
      router.refresh();
    } catch (error: any) {
      <Toast variant="destructive">
        <ToastTitle>Error</ToastTitle>
        <ToastDescription>{error.message || "Failed to record results."}</ToastDescription>
      </Toast>;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary">Record CBC Results</h1>
        <Button variant="outline" onClick={() => router.back()}>
          Back to Exam
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Enter Assessment Results (CBC)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {results.map((result, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-4 border p-4 rounded-lg bg-base-100">
              {/* Student */}
              <div className="md:col-span-2">
                <Label>Student</Label>
                <Select 
                  onValueChange={(v) => updateResult(index, "studentId", v)}
                  value={result.studentId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Learning Area */}
              <div>
                <Label>Learning Area</Label>
                <Select 
                  onValueChange={(v) => updateResult(index, "subjectId", v)}
                  value={result.subjectId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select area" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Marks */}
              <div>
                <Label>Marks</Label>
                <Input
                  type="number"
                  value={result.marks}
                  onChange={(e) => updateResult(index, "marks", Number(e.target.value))}
                />
              </div>

              {/* Assessment Type */}
              <div>
                <Label>Assessment Type</Label>
                <Select 
                  onValueChange={(v) => updateResult(index, "assessmentType", v)}
                  value={result.assessmentType}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {assessmentTypes.map(t => (
                      <SelectItem key={t} value={t}>{t.replace("_", " ")}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Competency Level */}
              <div>
                <Label>Competency Level</Label>
                <Select 
                  onValueChange={(v) => updateResult(index, "competencyLevel", v)}
                  value={result.competencyLevel}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Level" />
                  </SelectTrigger>
                  <SelectContent>
                    {competencyLevels.map(l => (
                      <SelectItem key={l} value={l}>
                        {l.replace(/_/g, " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Remarks */}
              <div className="md:col-span-6">
                <Label>Remarks / Observations</Label>
                <Textarea
                  value={result.remarks}
                  onChange={(e) => updateResult(index, "remarks", e.target.value)}
                  placeholder="Teacher comments, observations, strengths, areas for improvement..."
                />
              </div>
            </div>
          ))}

          <Button 
            onClick={addResultRow} 
            variant="outline" 
            className="w-full"
          >
            + Add Another Result Row
          </Button>

          <Button 
            onClick={handleSubmit} 
            disabled={loading || results.length === 0} 
            className="w-full"
          >
            {loading ? "Saving CBC Results..." : `Save All Results (${results.length})`}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}