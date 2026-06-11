import SubjectTable from "@/components/subjects/SubjectTable";
import { Button } from "@/components/ui/Button";
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { Plus } from "lucide-react";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function SubjectsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  const subjects = await prisma.subject.findMany({
    select: {
      id: true,
      name: true,
      code: true,
      description: true,
      createdAt: true,
      updatedAt: true,
      // teacher field removed - Subject model doesn't have direct teacher relation
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary">Subjects</h1>
        {session.user.role === "ADMIN" && (
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
          No subjects created yet.
        </div>
      ) : (
        <SubjectTable subjects={subjects} />
      )}
    </div>
  );
}