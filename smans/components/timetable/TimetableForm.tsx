"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

const timetableSchema = z.object({
  day: z.string().min(1, "Day is required"),
  time: z.string().min(1, "Time slot is required"),
  subject: z.string().min(2, "Subject is required"),
  teacher: z.string().optional(),
  room: z.string().optional(),
});

type TimetableFormData = z.infer<typeof timetableSchema>;

interface TimetableFormProps {
  defaultValues?: Partial<TimetableFormData>;
  onSubmit: (data: TimetableFormData) => Promise<void>;
  isLoading?: boolean;
}

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const timeSlots = [
  "8:00-9:00",
  "9:00-10:00",
  "10:00-11:00",
  "11:00-12:00",
  "12:00-1:00",
  "1:00-2:00",
  "2:00-3:00",
];

export default function TimetableForm({ defaultValues, onSubmit, isLoading }: TimetableFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TimetableFormData>({
    resolver: zodResolver(timetableSchema),
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="day">Day</Label>
          <Select onValueChange={(value) => setValue("day", value)} defaultValue={watch("day")}>
            <SelectTrigger>
              <SelectValue placeholder="Select day" />
            </SelectTrigger>
            <SelectContent>
              {days.map((day) => (
                <SelectItem key={day} value={day}>
                  {day}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.day && <p className="text-sm text-destructive mt-1">{errors.day.message}</p>}
        </div>

        <div>
          <Label htmlFor="time">Time Slot</Label>
          <Select onValueChange={(value) => setValue("time", value)} defaultValue={watch("time")}>
            <SelectTrigger>
              <SelectValue placeholder="Select time slot" />
            </SelectTrigger>
            <SelectContent>
              {timeSlots.map((slot) => (
                <SelectItem key={slot} value={slot}>
                  {slot}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.time && <p className="text-sm text-destructive mt-1">{errors.time.message}</p>}
        </div>

        <div>
          <Label htmlFor="subject">Subject</Label>
          <Input id="subject" {...register("subject")} placeholder="e.g., Mathematics" />
          {errors.subject && <p className="text-sm text-destructive mt-1">{errors.subject.message}</p>}
        </div>

        <div>
          <Label htmlFor="teacher">Teacher (Optional)</Label>
          <Input id="teacher" {...register("teacher")} placeholder="Teacher name" />
        </div>

        <div>
          <Label htmlFor="room">Room (Optional)</Label>
          <Input id="room" {...register("room")} placeholder="e.g., Room 101" />
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Add Period"}
        </Button>
      </div>
    </form>
  );
}