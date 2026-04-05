// components/grades/GradeEntryForm.tsx
"use client";

import { recordResults } from "@/app/actions/exams/recordResults";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
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

interface GradeEntryFormProps {
  examId: string;
  students: Array<{ id: string; name: string; admissionNumber?: string }>;
  subjects: Array<{ id: string; name: string }>;
  onSuccess?: () => void;
}

export default function GradeEntryForm({ 
  examId, 
  students, 
  subjects, 
  onSuccess 
}: GradeEntryFormProps) {
  
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const addEntry = () => {
    setEntries([...entries, {
      studentId: "",
      subjectId: "",
      marks: 0,
      maxMarks: 100,
      assessmentType: "TEST",
      competencyLevel: "",
      remarks: "",
    }]);
  };

  const updateEntry = (index: number, field: string, value: any) => {
    const newEntries = [...entries];
    newEntries[index] = { ...newEntries[index], [field]: value };
    setEntries(newEntries);
  };

  const removeEntry = (index: number) => {
    setEntries(entries.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (entries.length === 0) return;

    setLoading(true);

    try {
      await recordResults({
        examId,
        term: "TERM_2",           // Make this dynamic later
        results: entries,
      });

      alert("CBC results saved successfully!");
      
      setEntries([]); 
      onSuccess?.();
    } catch (error: any) {
      alert(`Error: ${error.message || "Failed to save results"}`);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>CBC Grade Entry Form</CardTitle>
        <p className="text-sm text-muted-foreground">
          Record learner performance across learning areas
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {entries.map((entry, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-7 gap-4 p-5 border rounded-xl bg-card">
            
            {/* Student */}
            <div className="md:col-span-2">
              <Label>Student</Label>
              <Select 
                value={entry.studentId} 
                onValueChange={(v) => updateEntry(index, "studentId", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} {s.admissionNumber && `(${s.admissionNumber})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Subject / Learning Area */}
            <div>
              <Label>Learning Area</Label>
              <Select 
                value={entry.subjectId} 
                onValueChange={(v) => updateEntry(index, "subjectId", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select area" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Marks */}
            <div>
              <Label>Marks Scored</Label>
              <Input
                type="number"
                value={entry.marks}
                onChange={(e) => updateEntry(index, "marks", Number(e.target.value))}
                min={0}
                max={100}
              />
            </div>

            {/* Assessment Type */}
            <div>
              <Label>Assessment Type</Label>
              <Select 
                value={entry.assessmentType} 
                onValueChange={(v) => updateEntry(index, "assessmentType", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {assessmentTypes.map((t) => (
                    <SelectItem key={t} value={t}>{t.replace("_", " ")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Competency Level */}
            <div>
              <Label>Competency Level</Label>
              <Select 
                value={entry.competencyLevel} 
                onValueChange={(v) => updateEntry(index, "competencyLevel", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  {competencyLevels.map((l) => (
                    <SelectItem key={l} value={l}>
                      {l.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Remarks */}
            <div className="md:col-span-2">
              <Label>Remarks / Observations</Label>
              <Textarea
                value={entry.remarks}
                onChange={(e) => updateEntry(index, "remarks", e.target.value)}
                placeholder="Additional comments..."
                rows={2}
              />
            </div>

            <div className="flex items-end justify-end">
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => removeEntry(index)}
              >
                Remove
              </Button>
            </div>
          </div>
        ))}

        <div className="flex gap-4 pt-4">
          <Button onClick={addEntry} variant="outline" className="flex-1">
            + Add New Entry
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading || entries.length === 0}
            className="flex-1"
          >
            {loading ? "Saving Results..." : "Save All CBC Results"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}