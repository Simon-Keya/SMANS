"use client";

import { Button } from "@/components/ui/Button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/Command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";

interface LearningArea {
  id: string;
  name: string;
}

interface LearningAreaSelectorProps {
  learningAreas: LearningArea[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

export default function LearningAreaSelector({
  learningAreas,
  selected,
  onChange,
}: LearningAreaSelectorProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Learning Areas Covered</label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selected.length === 0
              ? "Select learning areas..."
              : `${selected.length} learning area${selected.length > 1 ? "s" : ""} selected`}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Search learning areas..." />
            <CommandEmpty>No learning area found.</CommandEmpty>
            <CommandGroup>
              {learningAreas.map((area) => (
                <CommandItem
                  key={area.id}
                  value={area.name}
                  onSelect={() => {
                    const newSelected = selected.includes(area.id)
                      ? selected.filter((id) => id !== area.id)
                      : [...selected, area.id];
                    onChange(newSelected);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selected.includes(area.id) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {area.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}