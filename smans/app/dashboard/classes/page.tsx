import ClassTable from "@/components/dashboard/classes/ClassTable";
import { Button } from "@/components/ui/Button";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Plus } from "lucide-react";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function ClassesPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  const classes = await prisma.class.findMany({
    select: {
      id: true,
      name: true,
      level: true,
      teacher: {
        select: { name: true },
      },
      studentCount: true,
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary">Classes</h1>
        {session.user.role === "admin" && (
          <Button asChild className="btn-primary gap-2">
            <Link href="/dashboard/classes/new">
              <Plus className="h-4 w-4" />
              Add Class
            </Link>
          </Button>
        )}
      </div>

      {classes.length === 0 ? (
        <div className="text-center py-12 text-base-content/60 bg-base-200 rounded-lg">
          No classes created yet.
        </div>
      ) : (
        <ClassTable classes={classes} />
      )}
    </div>
  );
}