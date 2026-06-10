import TimetableForm from "@/components/timetable/TimetableForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { prisma } from "@/lib/prisma";

export default async function CreateTimetablePage() {
  // Fetch learning areas for the form dropdown
  const learningAreas = await prisma.learningArea.findMany({
    select: {
      id: true,
      name: true,
      code: true,
    },
    orderBy: { name: "asc" },
  });

  // Fetch teachers for the form dropdown - ensure name is not null
  const teachers = await prisma.user.findMany({
    where: { 
      role: "TEACHER",
      name: { not: null }, // Only get teachers with names
    },
    select: {
      id: true,
      name: true,
    },
    orderBy: { name: "asc" },
  });

  // Transform to ensure name is always a string (not null)
  const transformedTeachers = teachers.map(teacher => ({
    id: teacher.id,
    name: teacher.name || "Unnamed Teacher", // Provide fallback for null names
  }));

  // Transform learning areas to match expected format
  const transformedLearningAreas = learningAreas.map(area => ({
    id: area.id,
    name: area.name,
  }));

  const handleSubmit = async (data: any) => {
    "use server";
    // Save to DB
    console.log("Saved:", data);
    
    // Example: Save to database
    // await prisma.timetable.create({
    //   data: {
    //     day: data.day,
    //     startTime: data.time.split('-')[0],
    //     endTime: data.time.split('-')[1],
    //     room: data.room,
    //     classId: data.classId, // You'll need to add class selection
    //     subjectId: data.learningAreaId, // Map learning area to subject
    //   },
    // });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Create Timetable Period</CardTitle>
        </CardHeader>
        <CardContent>
          <TimetableForm 
            onSubmit={handleSubmit}
            learningAreas={transformedLearningAreas}
            teachers={transformedTeachers}
          />
        </CardContent>
      </Card>
    </div>
  );
}