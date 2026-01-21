import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, Edit } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface ClassDetailPageProps {
  params: { id: string };
}

export default async function ClassDetailPage({ params }: ClassDetailPageProps) {
  const classData = await prisma.class.findUnique({
    where: { id: params.id },
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

  return (
    <div className="space-y-6">
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
            Edit
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
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
              <p className="font-medium">{classData.teacher?.name ?? "Not assigned"}</p>
            </div>
            <div>
              <p className="text-sm text-base-content/60">Student Count</p>
              <p className="font-medium">{classData.students.length}</p>
            </div>
          </CardContent>
        </Card>

        {/* Student list in class */}
        <Card className="bg-base-100 shadow-lg border border-base-200">
          <CardHeader>
            <CardTitle className="text-xl text-primary">Enrolled Students</CardTitle>
          </CardHeader>
          <CardContent>
            {classData.students.length === 0 ? (
              <p className="text-base-content/60">No students enrolled yet.</p>
            ) : (
              <ul className="space-y-2">
                {classData.students.map((student) => (
                  <li key={student.id} className="flex items-center gap-2">
                    <span className="font-medium">{student.name}</span>
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