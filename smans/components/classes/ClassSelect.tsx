// components/classes/ClassSelect.tsx
"use client";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/Select";

interface Class {
  id: string;
  name: string;
  level?: string;
}

interface ClassSelectProps {
  classes: Class[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function ClassSelect({
  classes,
  value,
  onChange,
  placeholder = "Select class...",
  disabled = false,
}: ClassSelectProps) {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {classes.length === 0 ? (
          <SelectItem value="none" disabled>
            No classes available
          </SelectItem>
        ) : (
          classes.map((cls) => (
            <SelectItem key={cls.id} value={cls.id}>
              {cls.name} {cls.level ? `(${cls.level})` : ""}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
}