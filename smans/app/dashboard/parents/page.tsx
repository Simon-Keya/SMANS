// app/dashboard/parents/page.tsx
import ParentTable from "@/components/parents/ParentTable";
import { Button } from "@/components/ui/Button";
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { Plus } from "lucide-react";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

// Server action for delete
async function handleDelete(id: string): Promise<void> {
  "use server";
  
  try {
    // Check if parent has students
    const parent = await prisma.parent.findUnique({
      where: { id },
      include: {
        _count: {
          select: { students: true },
        },
      },
    });

    if (!parent) {
      throw new Error("Parent not found");
    }

    if (parent._count.students > 0) {
      throw new Error(`Cannot delete parent with ${parent._count.students} linked student(s). Please reassign students first.`);
    }

    // Delete parent and their user account
    await prisma.$transaction(async (tx) => {
      const parentToDelete = await tx.parent.findUnique({
        where: { id },
        include: { user: true },
      });

      if (!parentToDelete) {
        throw new Error("Parent not found");
      }

      await tx.parent.delete({
        where: { id },
      });

      if (parentToDelete.userId) {
        await tx.user.delete({
          where: { id: parentToDelete.userId },
        });
      }
    });

    revalidatePath("/dashboard/parents");
  } catch (error: any) {
    console.error("Delete error:", error);
    throw new Error(error.message || "Failed to delete parent");
  }
}

export default async function ParentsPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  // ✅ FIX: Fetch from Parent model directly (not User model)
  const parents = await prisma.parent.findMany({
    select: {
      id: true,           // ✅ This is the Parent ID
      name: true,
      email: true,
      phone: true,
      occupation: true,
      relationship: true,
      createdAt: true,
      userId: true,
      user: {
        select: {
          id: true,
          email: true,
          isActive: true,
        },
      },
      _count: {
        select: {
          students: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });

  // Transform data for the table component
  const parentsWithDetails = parents.map(parent => ({
    id: parent.id,  // ✅ This is the Parent ID
    name: parent.name,
    email: parent.email || parent.user?.email || "",
    phone: parent.phone,
    childrenCount: parent._count.students || 0,
    createdAt: parent.createdAt,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary">Parents</h1>
        <Button asChild className="btn-primary gap-2">
          <Link href="/dashboard/parents/new">
            <Plus className="h-4 w-4" />
            Add Parent
          </Link>
        </Button>
      </div>

      {parents.length === 0 ? (
        <div className="text-center py-12 text-base-content/60 bg-base-200 rounded-lg">
          No parents registered yet. Add your first parent.
        </div>
      ) : (
        <ParentTable 
          parents={parentsWithDetails} 
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}