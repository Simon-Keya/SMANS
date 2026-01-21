import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, Edit } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
interface SubjectDetailPageProps {
  params: { id: string };
}

export default async function SubjectDetailPage({ params }: SubjectDetailPageProps) {
  const subject = await prisma.subject.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      name: true,
      code: true,
      teacher: { select: { name: true } },
      classes: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!subject) {
    notFound();
  }

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
        <Button asChild variant="outline" className="gap-2">
          <Link href={`/dashboard/subjects/${subject.id}/edit`}>
            <Edit className="h-4 w-4" />
            Edit
          </Link>
        </Button>
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
              <p className="text-sm text-base-content/60">Assigned Teacher</p>
              <p className="font-medium">{subject.teacher?.name ?? "Not assigned"}</p>
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
              <ul className="space-y-2">
                {subject.classes.map((cls) => (
                  <li key={cls.name} className="font-medium">
                    {cls.name}
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