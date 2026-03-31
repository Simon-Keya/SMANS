"use client";

import { Badge } from "@/components/ui/Badge";
import { BookOpen, Clock, MapPin, User } from "lucide-react";
import React from "react"; // ← Added this import

interface Period {
  day: string;
  time: string;
  learningArea: string;
  strand?: string;
  subStrand?: string;
  teacher?: string;
  room?: string;
}

interface TimetableGridProps {
  periods: Period[];
  className?: string;
}

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const timeSlots = [
  "8:00-9:00", "9:00-10:00", "10:00-11:00",
  "11:00-12:00", "12:00-1:00", "1:00-2:00", "2:00-3:00"
];

export default function TimetableGrid({ periods, className = "" }: TimetableGridProps) {
  const getPeriodForSlot = (day: string, time: string) => {
    return periods.find((p) => p.day === day && p.time === time);
  };

  return (
    <div className={`overflow-x-auto ${className}`}>
      <div className="min-w-[1000px]">
        <div className="grid grid-cols-6 gap-px border border-border bg-border rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-background p-4 font-semibold text-center border-b">Time</div>
          {days.map((day) => (
            <div key={day} className="bg-background p-4 font-semibold text-center border-b">
              {day}
            </div>
          ))}

          {timeSlots.map((time) => (
            <React.Fragment key={time}>   {/* ← Now properly imported */}
              {/* Time Column */}
              <div className="bg-background p-4 text-sm font-medium flex items-center justify-center border-r">
                <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                {time}
              </div>

              {/* Days Columns */}
              {days.map((day) => {
                const period = getPeriodForSlot(day, time);
                return (
                  <div
                    key={`${day}-${time}`}
                    className="bg-card min-h-[110px] p-3 border-r border-b last:border-r-0 hover:bg-muted/50 transition-colors flex flex-col justify-center"
                  >
                    {period ? (
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <BookOpen className="h-4 w-4 mt-0.5 text-primary" />
                          <p className="font-semibold text-sm leading-tight">{period.learningArea}</p>
                        </div>

                        {period.strand && (
                          <p className="text-xs text-muted-foreground">Strand: {period.strand}</p>
                        )}
                        {period.subStrand && (
                          <p className="text-xs text-muted-foreground">Sub-strand: {period.subStrand}</p>
                        )}

                        {period.teacher && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <User className="h-3 w-3" />
                            <span>{period.teacher}</span>
                          </div>
                        )}

                        {period.room && (
                          <Badge variant="outline" className="text-xs w-fit">
                            <MapPin className="h-3 w-3 mr-1" />
                            {period.room}
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <div className="text-center text-xs text-muted-foreground py-6">
                        Free Period
                      </div>
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}