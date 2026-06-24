// app/dashboard/subjects/[id]/page.tsx
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { ArrowLeft, Edit } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

interface SubjectDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function SubjectDetailPage({ params }: SubjectDetailPageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  const userRole = session.user.role as string;
  const { id } = await params;
  
  // Build where clause based on role
  let whereClause: any = { id };

  if (userRole === "TEACHER") {
    // Check if teacher teaches this subject
    const teacherClasses = await prisma.class.findMany({
      where: { teacherId: session.user.id },
      select: { subjects: { select: { id: true } } },
    });
    const subjectIds = teacherClasses.flatMap(c => c.subjects.map(s => s.id));
    if (!subjectIds.includes(id)) {
      return redirect("/dashboard/subjects");
    }
  } else if (userRole === "STUDENT") {
    // Check if student's class has this subject
    const student = await prisma.student.findFirst({
      where: { userId: session.user.id },
      select: { class: { select: { subjects: { select: { id: true } } } } },
    });
    const subjectIds = student?.class?.subjects.map(s => s.id) || [];
    if (!subjectIds.includes(id)) {
      return redirect("/dashboard/subjects");
    }
  } else if (userRole === "PARENT") {
    // Check if parent's children's classes have this subject
    const children = await prisma.student.findMany({
      where: { parent: { userId: session.user.id } },
      select: { class: { select: { subjects: { select: { id: true } } } } },
    });
    const subjectIds = children.flatMap(c => c.class?.subjects.map(s => s.id) || []);
    if (!subjectIds.includes(id)) {
      return redirect("/dashboard/subjects");
    }
  }
  // ADMIN can view all subjects

  const subject = await prisma.subject.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      code: true,
      description: true,
      createdAt: true,
      classes: {
        select: {
          id: true,
          name: true,
          level: true,
          teacher: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  if (!subject) {
    notFound();
  }

  // Get unique teachers from the classes that teach this subject
  const teachers = subject.classes
    .filter(cls => cls.teacher !== null)
    .map(cls => cls.teacher?.name)
    .filter((name, index, self) => name && self.indexOf(name) === index);

  // ✅ Only ADMIN can edit
  const canEdit = userRole === "ADMIN";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/subjects">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-primary">{subject.name}</h1>
        </div>
        {canEdit && (
          <Button asChild variant="outline" className="gap-2">
            <Link href={`/dashboard/subjects/${subject.id}/edit`}>
              <Edit className="h-4 w-4" />
              Edit
            </Link>
          </Button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-base-100 shadow-lg border border-base-200">
          <CardHeader>
            <CardTitle className="text-xl text-primary">Subject Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-base-content/60">Code</p>
              <p className="font-medium">{subject.code}</p>
            </div>
            <div>
              <p className="text-sm text-base-content/60">Description</p>
              <p className="font-medium">{subject.description || "No description"}</p>
            </div>
            <div>
              <p className="text-sm text-base-content/60">Created</p>
              <p className="font-medium">{new Date(subject.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-base-content/60">Teachers</p>
              {teachers.length > 0 ? (
                <ul className="list-disc list-inside mt-1">
                  {teachers.map((teacher, index) => (
                    <li key={index} className="font-medium">{teacher}</li>
                  ))}
                </ul>
              ) : (
                <p className="font-medium text-base-content/60">No teachers assigned</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-base-100 shadow-lg border border-base-200">
          <CardHeader>
            <CardTitle className="text-xl text-primary">Classes Using This Subject</CardTitle>
          </CardHeader>
          <CardContent>
            {subject.classes.length === 0 ? (
              <p className="text-base-content/60">No classes assigned yet.</p>
            ) : (
              <div className="space-y-3">
                {subject.classes.map((cls) => (
                  <div key={cls.id} className="border-b pb-2 last:border-0">
                    <p className="font-medium">{cls.name} ({cls.level})</p>
                    {cls.teacher && (
                      <p className="text-sm text-base-content/60">
                        Teacher: {cls.teacher.name}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}