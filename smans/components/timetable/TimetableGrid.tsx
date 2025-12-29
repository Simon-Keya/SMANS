"use client";

import { Badge } from "@/components/ui/Badge";
import { Clock } from "lucide-react";

interface Period {
  day: string;
  time: string;
  subject: string;
  teacher?: string;
  room?: string;
}

interface TimetableGridProps {
  periods: Period[];
  className?: string;
}

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const timeSlots = ["8:00-9:00", "9:00-10:00", "10:00-11:00", "11:00-12:00", "12:00-1:00", "1:00-2:00", "2:00-3:00"];

export default function TimetableGrid({ periods, className }: TimetableGridProps) {
  const getPeriodForSlot = (day: string, time: string) => {
    return periods.find((p) => p.day === day && p.time === time);
  };

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[800px]">
        <div className="grid grid-cols-6 gap-px border border-border bg-border">
          {/* Header Row */}
          <div className="bg-background p-4 font-semibold text-center">Time</div>
          {days.map((day) => (
            <div key={day} className="bg-background p-4 font-semibold text-center">
              {day}
            </div>
          ))}

          {/* Time Slots */}
          {timeSlots.map((time) => (
            <>
              <div key={time} className="bg-background p-4 text-sm font-medium flex items-center justify-center">
                <Clock className="h-4 w-4 mr-1" />
                {time}
              </div>
              {days.map((day) => {
                const period = getPeriodForSlot(day, time);
                return (
                  <div
                    key={`${day}-${time}`}
                    className="bg-card min-h-[80px] p-3 flex flex-col justify-center border border-border hover:bg-muted/50 transition-colors"
                  >
                    {period ? (
                      <div className="space-y-1">
                        <p className="font-medium text-sm">{period.subject}</p>
                        {period.teacher && (
                          <p className="text-xs text-muted-foreground">{period.teacher}</p>
                        )}
                        {period.room && (
                          <Badge variant="secondary" className="text-xs">
                            {period.room}
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground text-center">-</p>
                    )}
                  </div>
                );
              })}
            </>
          ))}
        </div>
      </div>
    </div>
  );
}