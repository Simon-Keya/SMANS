// app/dashboard/teachers/[id]/page.tsx
import { Button } from "@/components/ui/Button";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { ArrowLeft, Edit } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

interface TeacherDetailPageProps {
  params: { id: string };
}

export default async function TeacherDetailPage({ params }: TeacherDetailPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  let teacher = null;

  try {
    teacher = await prisma.user.findUnique({
      where: { 
        id: params.id,
        role: "TEACHER" 
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        staffNo: true,
        createdAt: true,
      },
    });
  } catch (error) {
    console.error("Error fetching teacher detail:", error);
    return (
      <div className="p-12 text-center">
        <h2 className="text-2xl font-bold text-error">Failed to Load Teacher</h2>
        <p className="mt-4 text-base-content/70">Could not retrieve teacher information.</p>
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold">{teacher.name ?? "Unnamed Teacher"}</h1>
        </div>

        <Button asChild variant="outline">
          <Link href={`/dashboard/teachers/${teacher.id}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Teacher
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4 rounded-lg border bg-card p-6">
          <h2 className="text-xl font-semibold">Personal Information</h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Email</dt>
              <dd className="mt-1">{teacher.email}</dd>
            </div>
            
            {teacher.phone && (
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Phone Number</dt>
                <dd className="mt-1">{teacher.phone}</dd>
              </div>
            )}

            {teacher.staffNo && (
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Staff Number</dt>
                <dd className="mt-1">{teacher.staffNo}</dd>
              </div>
            )}

            <div>
              <dt className="text-sm font-medium text-muted-foreground">Joined On</dt>
              <dd className="mt-1">
                {new Date(teacher.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </dd>
            </div>
          </dl>
        </div>

        {/* You can add more cards here later (Classes, Attendance, etc.) */}
      </div>
    </div>
  );
}