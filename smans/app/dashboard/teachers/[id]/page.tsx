import { Button } from "@/components/ui/Button";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, Edit } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface TeacherDetailPageProps {
  params: { id: string };
}

export default async function TeacherDetailPage({ params }: TeacherDetailPageProps) {
  const teacher = await prisma.user.findUnique({
    where: { id: params.id, role: "TEACHER" },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      // add more: phone, subjectsTaught, etc.
    },
  });

  if (!teacher) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/teachers">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">{teacher.name}</h1>
        </div>
        <Button asChild variant="outline">
          <Link href={`/dashboard/teachers/${teacher.id}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4 rounded-lg border bg-card p-6">
          <h2 className="text-xl font-semibold">Personal Information</h2>
          <dl className="space-y-2">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Email</dt>
              <dd>{teacher.email}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Joined</dt>
              <dd>{new Date(teacher.createdAt).toLocaleDateString()}</dd>
            </div>
          </dl>
        </div>

        {/* Add more sections: classes taught, attendance stats, etc. */}
      </div>
    </div>
  );
}