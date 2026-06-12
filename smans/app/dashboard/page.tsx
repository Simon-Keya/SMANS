// app/dashboard/page.tsx
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function DashboardHome() {
  console.log("🔍 [Dashboard] Page loading...");

  const user = await getCurrentUser();
  console.log("🔍 [Dashboard] Current user:", user);

  if (!user) {
    console.log("🔍 [Dashboard] No user → Redirecting to login");
    redirect("/auth/login");
  }

  console.log("🔍 [Dashboard] User authenticated as:", user.role);

  // Fetch stats safely
  let stats = {
    totalStudents: 0,
    totalTeachers: 0,
  };

  try {
    // Only count if models exist
    stats.totalStudents = await prisma.student?.count() ?? 0;
    stats.totalTeachers = await prisma.user.count({
      where: { role: "TEACHER" },
    });

    console.log("🔍 [Dashboard] Stats loaded:", stats);
  } catch (error) {
    console.error("🔍 [Dashboard] Stats error:", error);
  }

  return (
    <div className="min-h-screen p-6 md:p-8 bg-base-100">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-primary">Dashboard</h1>
          <p className="text-base-content/70 mt-2 text-lg">
            Welcome back, <span className="font-semibold">{user.name || user.email}</span>!
          </p>
          <div className="mt-3 inline-flex items-center px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium">
            Role: {user.role}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="bg-base-200 rounded-2xl p-6 border border-base-300">
            <div className="text-5xl font-bold text-primary">{stats.totalStudents}</div>
            <div className="text-base-content/60 mt-1">Total Students</div>
          </div>

          <div className="bg-base-200 rounded-2xl p-6 border border-base-300">
            <div className="text-5xl font-bold text-primary">{stats.totalTeachers}</div>
            <div className="text-base-content/60 mt-1">Total Teachers</div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-base-200 rounded-2xl p-8 border border-base-300">
          <h2 className="text-2xl font-semibold mb-6">Quick Links</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {user.role === "ADMIN" && (
              <>
                <a href="/dashboard/students" className="btn btn-outline">Manage Students</a>
                <a href="/dashboard/teachers" className="btn btn-outline">Manage Teachers</a>
                <a href="/dashboard/classes" className="btn btn-outline">Classes</a>
                <a href="/dashboard/fees" className="btn btn-outline">Fees</a>
                <a href="/dashboard/reports" className="btn btn-outline">Reports</a>
              </>
            )}

            {user.role === "TEACHER" && (
              <>
                <a href="/dashboard/attendance/mark" className="btn btn-outline">Mark Attendance</a>
                <a href="/dashboard/grades/enter" className="btn btn-outline">Enter Grades</a>
                <a href="/dashboard/students" className="btn btn-outline">My Students</a>
              </>
            )}

            {user.role === "STUDENT" && (
              <>
                <a href="/dashboard/grades" className="btn btn-outline">My Grades</a>
                <a href="/dashboard/attendance" className="btn btn-outline">Attendance</a>
              </>
            )}

            {user.role === "PARENT" && (
              <>
                <a href="/dashboard/children" className="btn btn-outline">My Children</a>
                <a href="/dashboard/attendance" className="btn btn-outline">Attendance</a>
              </>
            )}
          </div>
        </div>

        {/* Debug Panel - Remove in production */}
        <div className="mt-12 p-6 bg-amber-100 border border-amber-300 rounded-2xl text-sm">
          <details>
            <summary className="font-semibold cursor-pointer">Debug Info (Development Only)</summary>
            <pre className="mt-4 text-xs overflow-auto bg-base-300 p-4 rounded-lg">
              {JSON.stringify({ user, stats }, null, 2)}
            </pre>
          </details>
        </div>
      </div>
    </div>
  );
}