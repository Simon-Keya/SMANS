import TimetableGrid from "@/components/timetable/TimetableGrid";
import { prisma } from "@/lib/prisma";

interface Period {
  day: string;
  time: string;
  learningArea: string;
  strand?: string;
  subStrand?: string;
  teacher?: string;
  room?: string;
}

interface ClassTimetablePageProps {
  params: Promise<{ classId: string }>;
}

export default async function ClassTimetablePage({ params }: ClassTimetablePageProps) {
  const { classId } = await params;
  
  // Fetch class name for display
  const classData = await prisma.class.findUnique({
    where: { id: classId },
    select: { 
      id: true,
      name: true,
      level: true,
    },
  });

  if (!classData) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-6">Class Not Found</h1>
        <div className="text-center py-12 text-base-content/60 bg-base-200 rounded-lg">
          The requested class could not be found.
        </div>
      </div>
    );
  }

  // Fetch timetable periods from database
  const timetablePeriods = await prisma.timetable.findMany({
    where: { classId },
    include: {
      subject: {
        select: {
          id: true,
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

  // Transform to match TimetableGrid's Period interface
  const periods: Period[] = timetablePeriods.map((period) => ({
    day: period.day,
    time: `${period.startTime}-${period.endTime}`,
    learningArea: period.subject.name,
    room: period.room || undefined,
    // Add teacher if you have teacher relation in your schema
    // teacher: period.teacher?.name,
    // Add strand and subStrand if you have these fields in your schema
    // strand: period.strand || undefined,
    // subStrand: period.subStrand || undefined,
  }));

  // If no data, show empty state
  if (periods.length === 0) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-6">
          {classData.name} {classData.level} Timetable
        </h1>
        <div className="text-center py-12 text-base-content/60 bg-base-200 rounded-lg">
          No timetable periods set up for this class yet.
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">
        {classData.name} {classData.level} Timetable
      </h1>
      <TimetableGrid periods={periods} />
    </div>
  );
}