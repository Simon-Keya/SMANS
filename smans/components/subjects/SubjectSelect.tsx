// components/subjects/SubjectSelect.tsx
"use client";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/Select";

interface Subject {
  id: string;
  name: string;
  code?: string;
}

interface SubjectSelectProps {
  subjects: Subject[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export default function SubjectSelect({
  subjects,
  value,
  onChange,
  placeholder = "Select a subject...",
  disabled = false,
  className,
}: SubjectSelectProps) {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {subjects.length === 0 ? (
          <SelectItem value="none" disabled>
            No subjects available
          </SelectItem>
        ) : (
          subjects.map((subject) => (
            <SelectItem key={subject.id} value={subject.id}>
              {subject.name} {subject.code ? `(${subject.code})` : ""}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
}