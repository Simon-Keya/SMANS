import ParentTable from "@/components/parents/ParentTable";
import { Button } from "@/components/ui/Button";
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { Plus } from "lucide-react";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function ParentsPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const parents = await prisma.user.findMany({
    where: { role: "PARENT" }, // Changed from "parent" to "PARENT" (uppercase)
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      // Include parent relation to get additional parent-specific data
      parent: {
        select: {
          phone: true,
          occupation: true,
          relationship: true,
          _count: {
            select: { students: true }
          }
        }
      }
    },
    orderBy: { name: "asc" },
  });

  // Transform data to include parent-specific fields at the root level if needed
  const parentsWithDetails = parents.map(parent => ({
    id: parent.id,
    name: parent.name,
    email: parent.email,
    role: parent.role,
    createdAt: parent.createdAt,
    phone: parent.parent?.phone,
    occupation: parent.parent?.occupation,
    relationship: parent.parent?.relationship,
    studentCount: parent.parent?._count.students || 0,
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
        <ParentTable parents={parentsWithDetails} />
      )}
    </div>
  );
}