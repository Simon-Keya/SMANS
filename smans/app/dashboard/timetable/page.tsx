import TimetableGrid from "@/components/timetable/TimetableGrid";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

const mockPeriods = [
  { day: "Monday", time: "8:00-9:00", subject: "Mathematics", teacher: "Mr. Smith" },
  // Add more
];

export default function TimetablePage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Timetable</h1>
        <Button asChild>
          <Link href="/dashboard/timetable/create">Create Period</Link>
        </Button>
      </div>
      <TimetableGrid periods={mockPeriods} />
    </div>
  );
}