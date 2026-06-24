// app/dashboard/timetable/page.tsx
import TimetableGrid from "@/components/timetable/TimetableGrid";
import { Button } from "@/components/ui/Button";
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function TimetablePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  const userRole = session.user.role as string;
  const userId = session.user.id;

  // Build where clause based on role
  let whereClause: any = {};

  if (userRole === "TEACHER") {
    // Teachers see timetable for their classes
    const teacherClasses = await prisma.class.findMany({
      where: { teacherId: userId },
      select: { id: true },
    });
    const classIds = teacherClasses.map(c => c.id);
    whereClause = { classId: { in: classIds } };
  } else if (userRole === "STUDENT") {
    // Students see timetable for their class
    const student = await prisma.student.findFirst({
      where: { userId: userId },
      select: { classId: true },
    });
    if (student) {
      whereClause = { classId: student.classId };
    }
  } else if (userRole === "PARENT") {
    // Parents see timetable for their children's classes
    const children = await prisma.student.findMany({
      where: { parent: { userId: userId } },
      select: { classId: true },
    });
    const classIds = children.map(c => c.classId);
    whereClause = { classId: { in: classIds } };
  }
  // ADMIN sees all timetable entries (no where clause)

  // Fetch timetable data from database
  const timetablePeriods = await prisma.timetable.findMany({
    where: whereClause,
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
          level: true,
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
    className: period.class.name,
    classLevel: period.class.level,
  }));

  // ✅ Only ADMIN and TEACHER can create timetable entries
  const canCreate = ["ADMIN", "TEACHER"].includes(userRole);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary">Timetable</h1>
          <p className="text-muted-foreground mt-1">
            {userRole === "ADMIN" && "Manage all school timetables"}
            {userRole === "TEACHER" && "View your class timetables"}
            {userRole === "STUDENT" && "Your class timetable"}
            {userRole === "PARENT" && "Your children's class timetables"}
          </p>
        </div>
        {canCreate && (
          <Button asChild>
            <Link href="/dashboard/timetable/create">Create Period</Link>
          </Button>
        )}
      </div>
      
      {periods.length === 0 ? (
        <div className="text-center py-12 text-base-content/60 bg-base-200 rounded-lg">
          No timetable periods found.
          {canCreate && (
            <div className="mt-4">
              <Button asChild variant="outline">
                <Link href="/dashboard/timetable/create">Create your first period</Link>
              </Button>
            </div>
          )}
        </div>
      ) : (
        <TimetableGrid periods={periods} />
      )}
    </div>
  );
}