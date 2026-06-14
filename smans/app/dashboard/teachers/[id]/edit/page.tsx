// app/dashboard/teachers/[id]/edit/page.tsx
import TeacherForm from "@/components/teachers/TeacherForm";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";

interface EditTeacherPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditTeacherPage({ params }: EditTeacherPageProps) {
  try {
    // Get current user
    const user = await getCurrentUser();

    // Check if user is authenticated and is ADMIN (not TEACHER)
    if (!user) {
      console.error("❌ No user found, redirecting to login");
      redirect("/auth/login");
    }

    if (user.role !== "ADMIN") {
      console.error(`❌ User ${user.email} has role ${user.role}, not ADMIN`);
      redirect("/dashboard");
    }

    console.log("✅ User authorized as ADMIN:", user.email);

    // Await params to get the ID
    const { id } = await params;
    console.log("🔍 Teacher ID from URL:", id);

    if (!id) {
      console.error("❌ No teacher ID provided in URL");
      return (
        <div className="p-12 text-center">
          <h2 className="text-2xl font-bold text-error mb-4">Invalid Request</h2>
          <p className="text-base-content/70">No teacher ID was provided in the URL.</p>
          <p className="text-sm mt-4 text-base-content/50">
            The URL should be: /dashboard/teachers/[teacher-id]/edit
          </p>
        </div>
      );
    }

    // Fetch teacher from database
    let teacher = null;

    try {
      teacher = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          staffNo: true,
          role: true,
        },
      });

      console.log("🔍 Database query result:", teacher ? "Teacher found" : "No teacher found");

      // Verify it's a TEACHER role
      if (teacher && teacher.role !== "TEACHER") {
        console.error(`❌ User exists but role is ${teacher.role}, not TEACHER`);
        teacher = null;
      }
    } catch (dbError) {
      console.error("❌ Database error:", dbError);
      throw dbError;
    }

    if (!teacher) {
      console.error(`❌ Teacher not found with ID: ${id}`);
      notFound();
    }

    console.log("✅ Teacher loaded successfully:", teacher.name);

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Edit Teacher: {teacher.name ?? "Unnamed Teacher"}
            </h1>
            <p className="text-base-content/60 mt-1">Update teacher information below</p>
          </div>
        </div>

        <TeacherForm teacher={teacher} />
      </div>
    );
  } catch (error) {
    console.error("💥 Unexpected error in EditTeacherPage:", error);
    return (
      <div className="p-12 text-center">
        <h2 className="text-2xl font-bold text-error mb-4">Something Went Wrong</h2>
        <p className="text-base-content/70">An unexpected error occurred while loading this page.</p>
        <p className="text-sm mt-6 text-base-content/50">
          Error: {error instanceof Error ? error.message : "Unknown error"}
        </p>
      </div>
    );
  }
}