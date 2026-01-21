// components/attendance/AttendanceFilters.tsx
"use client";

import { Button } from "@/components/ui/Button";
import { Calendar } from "@/components/ui/Calendar";
import { Input } from "@/components/ui/Input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/Popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";

export default function AttendanceFilters() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [search, setSearch] = useState("");

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-end">
      <div className="flex-1 space-y-2">
        <label className="text-sm font-medium">Search Student</label>
        <Input
          placeholder="Student name or ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Date</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full sm:w-[240px] justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <Button className="btn-primary">Apply Filters</Button>
    </div>
  );
}