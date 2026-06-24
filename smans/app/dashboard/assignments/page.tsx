// app/dashboard/assignments/page.tsx
"use client";

import AssignmentList from "@/components/assignments/AssignmentList";
import AssignmentTable from "@/components/assignments/AssignmentTable";
import { Button } from "@/components/ui/Button";
import { useAssignments } from "@/hooks/useAssignments";
import { useRole } from "@/hooks/useRole";
import { PlusCircle } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function AssignmentsPage() {
  const { isTeacher, isAdmin, isLoading: roleLoading } = useRole();
  const { data: session } = useSession();

  const canManage = isTeacher || isAdmin;
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user?.role) {
      setUserRole(session.user.role);
    }
  }, [session]);

  // Get assignments based on role
  const { assignments, isLoading, error, refresh } = useAssignments({
    // For students, fetch assignments for their class
    // For teachers, fetch assignments for their classes
    // For admins, fetch all assignments
  });

  if (roleLoading || isLoading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-pulse">Loading assignments...</div>
      </div>
    );
  }

  if (error) {
    toast.error("Failed to load assignments");
    return (
      <div className="p-6 text-red-600">
        Error loading assignments. Please try again.
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Assignments</h1>
          <p className="text-muted-foreground mt-1">
            {userRole === "ADMIN" && "Manage all assignments in the system"}
            {userRole === "TEACHER" && "Manage assignments for your classes"}
            {userRole === "STUDENT" && "View your assignments"}
            {userRole === "PARENT" && "View your children's assignments"}
          </p>
        </div>

        {canManage && (
          <Link href="/dashboard/assignments/create">
            <Button className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              Create Assignment
            </Button>
          </Link>
        )}
      </div>

      {/* Table view for teachers/admins */}
      {canManage ? (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold mb-4">All Assignments</h2>
            <AssignmentTable />
          </div>
        </div>
      ) : (
        <div>
          <h2 className="text-2xl font-semibold mb-4">
            {userRole === "STUDENT" ? "Your Assignments" : "Assignments"}
          </h2>
          <AssignmentList />
        </div>
      )}

      {assignments?.length === 0 && !isLoading && (
        <div className="text-center py-12 text-gray-500">
          No assignments found
        </div>
      )}
    </div>
  );
}