import ClassTable from "@/components/classes/ClassTable";
import { Button } from "@/components/ui/Button";
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { Plus } from "lucide-react";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { deleteClass } from "@/app/actions/classes/deleteClass";
import { revalidatePath } from "next/cache";

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
      _count: {
        select: { students: true },
      },
    },
    orderBy: { name: "asc" },
  });

  // Transform the data to match ClassTable expectations.
  const classesWithCount = classes.map(cls => ({
    id: cls.id,
    name: cls.name,
    level: cls.level,
    teacher: cls.teacher ? { name: cls.teacher.name || "Unassigned" } : { name: "Unassigned" },
    studentCount: cls._count.students,
  }));

  // Server action for delete - returns Promise<void> to match ClassTable expectation
  async function handleDelete(id: string): Promise<void> {
    "use server";
    
    try {
      const result = await deleteClass(id);
      
      if (!result.success) {
        throw new Error(result.error || "Failed to delete class");
      }
      
      // Revalidate the page to show updated data
      revalidatePath("/dashboard/classes");
    } catch (error: any) {
      console.error("Delete error:", error);
      // Re-throw the error so the table component can handle it
      throw new Error(error.message || "Failed to delete class");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary">Classes</h1>
        {session.user.role === "ADMIN" && (
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
        <ClassTable 
          classes={classesWithCount} 
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}