// app/dashboard/timetable/create/page.tsx
import TimetableForm from "@/components/timetable/TimetableForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function CreateTimetablePage() {
  const session = await getServerSession(authOptions);

  // ✅ Only ADMIN and TEACHER can create timetable entries
  if (!session || !["ADMIN", "TEACHER"].includes(session.user.role)) {
    redirect("/dashboard");
  }

  // Fetch all required data in parallel
  const [learningAreas, teachers, classes] = await Promise.all([
    prisma.learningArea.findMany({
      select: { id: true, name: true, code: true },
      orderBy: { name: "asc" },
    }),
    prisma.user.findMany({
      where: { 
        role: "TEACHER",
        name: { not: null },
      },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.class.findMany({
      select: { id: true, name: true, level: true },
      orderBy: [{ level: "asc" }, { name: "asc" }],
    }),
  ]);

  const transformedTeachers = teachers.map(teacher => ({
    id: teacher.id,
    name: teacher.name || "Unnamed Teacher",
  }));

  const transformedLearningAreas = learningAreas.map(area => ({
    id: area.id,
    name: area.name,
  }));

  const transformedClasses = classes.map(cls => ({
    id: cls.id,
    name: cls.name,
    level: cls.level || "Unknown",
  }));

  const handleSubmit = async (data: any) => {
    "use server";
    const { day, time, learningAreaId, classId, room, teacherId } = data;
    
    if (!day || !time || !learningAreaId || !classId) {
      throw new Error("Missing required fields: day, time, learningAreaId, classId");
    }

    const [startTime, endTime] = time.split('-');

    await prisma.timetable.create({
      data: {
        day,
        startTime: startTime.trim(),
        endTime: endTime.trim(),
        room: room || null,
        classId,
        subjectId: learningAreaId, // Map learning area to subject
      },
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Create Timetable Period</CardTitle>
          <p className="text-sm text-muted-foreground">
            Schedule a new period for a class
          </p>
        </CardHeader>
        <CardContent>
          <TimetableForm 
            onSubmit={handleSubmit}
            learningAreas={transformedLearningAreas}
            teachers={transformedTeachers}
            classes={transformedClasses}
          />
        </CardContent>
      </Card>
    </div>
  );
}