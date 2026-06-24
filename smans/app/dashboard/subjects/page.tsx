// app/dashboard/subjects/page.tsx
import SubjectTable from "@/components/subjects/SubjectTable";
import { Button } from "@/components/ui/Button";
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { Plus } from "lucide-react";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/permissions";

export default async function SubjectsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  const userRole = session.user.role as string;

  // ✅ Everyone can view subjects, but with different data based on role
  let whereClause: any = {};

  if (userRole === "TEACHER") {
    // Teachers see subjects they teach (through classes)
    const teacherClasses = await prisma.class.findMany({
      where: { teacherId: session.user.id },
      select: { subjects: { select: { id: true } } },
    });
    const subjectIds = teacherClasses.flatMap(c => c.subjects.map(s => s.id));
    whereClause = { id: { in: subjectIds } };
  } else if (userRole === "STUDENT") {
    // Students see subjects for their class
    const student = await prisma.student.findFirst({
      where: { userId: session.user.id },
      select: { class: { select: { subjects: { select: { id: true } } } } },
    });
    const subjectIds = student?.class?.subjects.map(s => s.id) || [];
    whereClause = { id: { in: subjectIds } };
  } else if (userRole === "PARENT") {
    // Parents see subjects for their children's classes
    const children = await prisma.student.findMany({
      where: { parent: { userId: session.user.id } },
      select: { class: { select: { subjects: { select: { id: true } } } } },
    });
    const subjectIds = children.flatMap(c => c.class?.subjects.map(s => s.id) || []);
    whereClause = { id: { in: subjectIds } };
  }
  // ADMIN sees all subjects (no where clause)

  const subjects = await prisma.subject.findMany({
    where: whereClause,
    select: {
      id: true,
      name: true,
      code: true,
      description: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { name: "asc" },
  });

  // ✅ Only ADMIN can create subjects
  const canCreate = userRole === "ADMIN";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary">Subjects</h1>
        {canCreate && (
          <Button asChild className="btn-primary gap-2">
            <Link href="/dashboard/subjects/new">
              <Plus className="h-4 w-4" />
              Add Subject
            </Link>
          </Button>
        )}
      </div>

      {subjects.length === 0 ? (
        <div className="text-center py-12 text-base-content/60 bg-base-200 rounded-lg">
          No subjects found.
          {userRole !== "ADMIN" && " Your subjects will appear here once assigned."}
        </div>
      ) : (
        <SubjectTable subjects={subjects} />
      )}
    </div>
  );
}