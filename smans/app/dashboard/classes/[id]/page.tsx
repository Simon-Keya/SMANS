// app/dashboard/classes/[id]/page.tsx
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, Edit } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

type SelectedStudent = {
  id: string;
  name: string | null;
};

interface ClassDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ClassDetailPage({ params }: ClassDetailPageProps) {
  // ✅ CRITICAL: Await params to get the id
  const { id } = await params;

  const classData = await prisma.class.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      level: true,
      teacher: { select: { name: true } },
      students: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!classData) {
    notFound();
  }

  // Give students an explicit type so .map() is fully typed
  const students: SelectedStudent[] = classData.students;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/classes">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-primary">{classData.name}</h1>
        </div>

        <Button asChild variant="outline" className="gap-2">
          <Link href={`/dashboard/classes/${classData.id}/edit`}>
            <Edit className="h-4 w-4" />
            Edit Class
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Class Information */}
        <Card className="bg-base-100 shadow-lg border border-base-200">
          <CardHeader>
            <CardTitle className="text-xl text-primary">Class Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-base-content/60">Level</p>
              <p className="font-medium">{classData.level}</p>
            </div>
            <div>
              <p className="text-sm text-base-content/60">Class Teacher</p>
              <p className="font-medium">
                {classData.teacher?.name ?? "Not assigned"}
              </p>
            </div>
            <div>
              <p className="text-sm text-base-content/60">Student Count</p>
              <p className="font-medium">{students.length}</p>
            </div>
          </CardContent>
        </Card>

        {/* Enrolled Students */}
        <Card className="bg-base-100 shadow-lg border border-base-200">
          <CardHeader>
            <CardTitle className="text-xl text-primary">
              Enrolled Students ({students.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {students.length === 0 ? (
              <p className="text-base-content/60 italic">
                No students enrolled in this class yet.
              </p>
            ) : (
              <ul className="space-y-3">
                {students.map((student: SelectedStudent) => (
                  <li
                    key={student.id}
                    className="flex items-center justify-between py-2 border-b border-base-200 last:border-b-0"
                  >
                    <span className="font-medium text-base-content">
                      {student.name ?? "Unnamed Student"}
                    </span>
                    <Link
                      href={`/dashboard/students/${student.id}`}
                      className="text-sm text-primary hover:text-primary-focus hover:underline"
                    >
                      View Profile
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}