// components/exams/ExamSubjectsSelector.tsx
"use client";

import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/Popover";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";

interface Subject {
  id: string;
  name: string;
}

interface ExamSubjectsSelectorProps {
  subjects: Subject[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

export default function ExamSubjectsSelector({
  subjects,
  selected,
  onChange,
}: ExamSubjectsSelectorProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Subjects Covered</label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selected.length === 0
              ? "Select subjects..."
              : `${selected.length} subject${selected.length > 1 ? "s" : ""} selected`}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Search subjects..." />
            <CommandEmpty>No subject found.</CommandEmpty>
            <CommandGroup>
              {subjects.map((subject) => (
                <CommandItem
                  key={subject.id}
                  value={subject.name}
                  onSelect={() => {
                    const newSelected = selected.includes(subject.id)
                      ? selected.filter((id) => id !== subject.id)
                      : [...selected, subject.id];
                    onChange(newSelected);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selected.includes(subject.id) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {subject.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}