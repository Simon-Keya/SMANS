// app/dashboard/timetable/[classId]/page.tsx
import TimetableGrid from "@/components/timetable/TimetableGrid";
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

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
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  const userRole = session.user.role as string;
  const userId = session.user.id;
  const { classId } = await params;

  // Verify user has access to this class
  let hasAccess = false;

  if (userRole === "ADMIN") {
    hasAccess = true;
  } else if (userRole === "TEACHER") {
    const classData = await prisma.class.findFirst({
      where: { id: classId, teacherId: userId },
    });
    hasAccess = !!classData;
  } else if (userRole === "STUDENT") {
    const student = await prisma.student.findFirst({
      where: { userId: userId, classId },
    });
    hasAccess = !!student;
  } else if (userRole === "PARENT") {
    const child = await prisma.student.findFirst({
      where: { classId, parent: { userId: userId } },
    });
    hasAccess = !!child;
  }

  if (!hasAccess) {
    redirect("/dashboard/timetable");
  }

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