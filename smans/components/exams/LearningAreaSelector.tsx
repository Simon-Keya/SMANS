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
  selected: string[];           // array of learningArea IDs
  onChange: (selected: string[]) => void;
  placeholder?: string;
}

export default function LearningAreaSelector({
  learningAreas,
  selected,
  onChange,
  placeholder = "Select learning areas...",
}: LearningAreaSelectorProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">Learning Areas Covered</Label>
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selected.length === 0 
              ? placeholder 
              : `${selected.length} learning area${selected.length > 1 ? "s" : ""} selected`
            }
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder="Search learning areas..." />
            <CommandEmpty>No learning area found.</CommandEmpty>
            
            <CommandGroup className="max-h-[300px] overflow-auto">
              {learningAreas.map((area) => (
                <CommandItem
                  key={area.id}
                  value={area.name}
                  onSelect={() => {
                    const isSelected = selected.includes(area.id);
                    const newSelected = isSelected
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

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selected.map((id) => {
            const area = learningAreas.find(a => a.id === id);
            return area ? (
              <Badge key={id} variant="secondary" className="text-xs">
                {area.name}
              </Badge>
            ) : null;
          })}
        </div>
      )}
    </div>
  );
}


import { Badge } from "@/components/ui/Badge";
import { Label } from "@/components/ui/Label";
