"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

const timetableSchema = z.object({
  day: z.string().min(1, "Day is required"),
  time: z.string().min(1, "Time slot is required"),
  learningAreaId: z.string().min(1, "Learning Area is required"),
  classId: z.string().min(1, "Class is required"), // ✅ Added classId
  strand: z.string().optional(),
  subStrand: z.string().optional(),
  teacherId: z.string().optional(),
  room: z.string().optional(),
  remarks: z.string().optional(),
});

type TimetableFormData = z.infer<typeof timetableSchema>;

interface TimetableFormProps {
  defaultValues?: Partial<TimetableFormData>;
  onSubmit: (data: TimetableFormData) => Promise<void>;
  isLoading?: boolean;
  learningAreas: Array<{ id: string; name: string }>;
  teachers: Array<{ id: string; name: string }>;
  classes: Array<{ id: string; name: string; level: string }>; // ✅ Added classes
}

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const timeSlots = [
  "8:00-9:00", "9:00-10:00", "10:00-11:00",
  "11:00-12:00", "12:00-1:00", "1:00-2:00", "2:00-3:00"
];

export default function TimetableForm({ 
  defaultValues, 
  onSubmit, 
  isLoading = false,
  learningAreas,
  teachers,
  classes, // ✅ Added classes prop
}: TimetableFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TimetableFormData>({
    resolver: zodResolver(timetableSchema),
    defaultValues: {
      day: "",
      time: "",
      learningAreaId: "",
      classId: "", // ✅ Added default
      strand: "",
      subStrand: "",
      teacherId: "",
      room: "",
      remarks: "",
      ...defaultValues,
    },
  });

  const selectedDay = watch("day");
  const selectedTime = watch("time");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Day */}
        <div className="space-y-2">
          <Label htmlFor="day">Day</Label>
          <Select onValueChange={(value) => setValue("day", value)} value={selectedDay}>
            <SelectTrigger>
              <SelectValue placeholder="Select day" />
            </SelectTrigger>
            <SelectContent>
              {days.map((day) => (
                <SelectItem key={day} value={day}>{day}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.day && <p className="text-sm text-destructive">{errors.day.message}</p>}
        </div>

        {/* Time Slot */}
        <div className="space-y-2">
          <Label htmlFor="time">Time Slot</Label>
          <Select onValueChange={(value) => setValue("time", value)} value={selectedTime}>
            <SelectTrigger>
              <SelectValue placeholder="Select time slot" />
            </SelectTrigger>
            <SelectContent>
              {timeSlots.map((slot) => (
                <SelectItem key={slot} value={slot}>{slot}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.time && <p className="text-sm text-destructive">{errors.time.message}</p>}
        </div>

        {/* Learning Area */}
        <div className="space-y-2">
          <Label htmlFor="learningAreaId">Learning Area</Label>
          <Select onValueChange={(value) => setValue("learningAreaId", value)} value={watch("learningAreaId")}>
            <SelectTrigger>
              <SelectValue placeholder="Select Learning Area" />
            </SelectTrigger>
            <SelectContent>
              {learningAreas.map((area) => (
                <SelectItem key={area.id} value={area.id}>
                  {area.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.learningAreaId && <p className="text-sm text-destructive">{errors.learningAreaId.message}</p>}
        </div>

        {/* Class */}
        <div className="space-y-2">
          <Label htmlFor="classId">Class</Label>
          <Select onValueChange={(value) => setValue("classId", value)} value={watch("classId")}>
            <SelectTrigger>
              <SelectValue placeholder="Select class" />
            </SelectTrigger>
            <SelectContent>
              {classes.map((cls) => (
                <SelectItem key={cls.id} value={cls.id}>
                  {cls.name} {cls.level ? `(${cls.level})` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.classId && <p className="text-sm text-destructive">{errors.classId.message}</p>}
        </div>

        {/* Strand & Sub-strand */}
        <div className="space-y-2">
          <Label htmlFor="strand">Strand (Optional)</Label>
          <Input id="strand" {...register("strand")} placeholder="e.g., Numbers" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="subStrand">Sub-Strand (Optional)</Label>
          <Input id="subStrand" {...register("subStrand")} placeholder="e.g., Whole Numbers" />
        </div>

        {/* Teacher */}
        <div className="space-y-2">
          <Label htmlFor="teacherId">Teacher</Label>
          <Select onValueChange={(value) => setValue("teacherId", value)} value={watch("teacherId")}>
            <SelectTrigger>
              <SelectValue placeholder="Select teacher" />
            </SelectTrigger>
            <SelectContent>
              {teachers.map((teacher) => (
                <SelectItem key={teacher.id} value={teacher.id}>
                  {teacher.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Room */}
        <div className="space-y-2">
          <Label htmlFor="room">Room / Venue (Optional)</Label>
          <Input id="room" {...register("room")} placeholder="e.g., Classroom 4A" />
        </div>

        {/* Remarks */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="remarks">Remarks / Notes (Optional)</Label>
          <Textarea 
            id="remarks" 
            {...register("remarks")} 
            placeholder="Any special instructions or CBC notes..."
            rows={3}
          />
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={isLoading || isSubmitting} className="min-w-[160px]">
          {isLoading || isSubmitting ? "Saving Timetable..." : "Add to Timetable"}
        </Button>
      </div>
    </form>
  );
}