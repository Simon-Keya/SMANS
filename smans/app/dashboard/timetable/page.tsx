import TimetableGrid from "@/components/timetable/TimetableGrid";
import { Button } from "@/components/ui/Button";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function TimetablePage() {
  // Fetch timetable data from database
  const timetablePeriods = await prisma.timetable.findMany({
    include: {
      subject: {
        select: {
          name: true,
          code: true,
        },
      },
      class: {
        select: {
          name: true,
        },
      },
    },
    orderBy: [{ day: "asc" }, { startTime: "asc" }],
  });

  // Transform to match Period interface
  const periods = timetablePeriods.map((period) => ({
    day: period.day,
    time: `${period.startTime}-${period.endTime}`,
    learningArea: period.subject.name,
    room: period.room || undefined,
    // Add teacher if available in your schema
    // teacher: period.teacher?.name,
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Timetable</h1>
        <Button asChild>
          <Link href="/dashboard/timetable/create">Create Period</Link>
        </Button>
      </div>
      
      {periods.length === 0 ? (
        <div className="text-center py-12 text-base-content/60 bg-base-200 rounded-lg">
          No timetable periods created yet.
          <div className="mt-4">
            <Button asChild variant="outline">
              <Link href="/dashboard/timetable/create">Create your first period</Link>
            </Button>
          </div>
        </div>
      ) : (
        <TimetableGrid periods={periods} />
      )}
    </div>
  );
}