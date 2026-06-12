// app/dashboard/page.tsx
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function DashboardHome() {
  console.log("🔍 [1] Dashboard page starting...");
  
  const user = await getCurrentUser();
  console.log("🔍 [2] Current user:", user);

  if (!user) {
    console.log("🔍 [3] No user found, redirecting to login");
    redirect("/auth/login");
  }

  console.log("🔍 [4] User role:", user.role);

  // Try to fetch some basic stats
  let stats = {
    totalStudents: 0,
    totalTeachers: 0,
  };

  try {
    stats.totalStudents = await prisma.student.count();
    stats.totalTeachers = await prisma.user.count({ where: { role: "TEACHER" } });
    console.log("🔍 [5] Stats fetched:", stats);
  } catch (error) {
    console.error("🔍 [5] Error fetching stats:", error);
  }

  return (
    <div className="min-h-screen p-8 bg-base-100">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary">Dashboard</h1>
          <p className="text-base-content/60 mt-2">
            Welcome back, <span className="font-semibold text-base-content">{user.name || user.email}</span>!
          </p>
          <div className="mt-2 inline-block px-3 py-1 bg-primary/10 rounded-full text-sm text-primary">
            Role: {user.role}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-base-200 rounded-xl p-6 border border-base-300">
            <div className="text-4xl font-bold text-primary">{stats.totalStudents}</div>
            <div className="text-base-content/60 mt-1">Total Students</div>
          </div>
          <div className="bg-base-200 rounded-xl p-6 border border-base-300">
            <div className="text-4xl font-bold text-primary">{stats.totalTeachers}</div>
            <div className="text-base-content/60 mt-1">Total Teachers</div>
          </div>
        </div>

        {/* Quick Links based on role */}
        <div className="bg-base-200 rounded-xl p-6 border border-base-300">
          <h2 className="text-xl font-semibold mb-4">Quick Links</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {user.role === "ADMIN" && (
              <>
                <a href="/dashboard/students" className="btn btn-outline btn-sm">Manage Students</a>
                <a href="/dashboard/teachers" className="btn btn-outline btn-sm">Manage Teachers</a>
                <a href="/dashboard/classes" className="btn btn-outline btn-sm">Manage Classes</a>
                <a href="/dashboard/fees" className="btn btn-outline btn-sm">Fee Management</a>
                <a href="/dashboard/reports" className="btn btn-outline btn-sm">Reports</a>
              </>
            )}
            {user.role === "TEACHER" && (
              <>
                <a href="/dashboard/attendance/mark" className="btn btn-outline btn-sm">Mark Attendance</a>
                <a href="/dashboard/grades/enter" className="btn btn-outline btn-sm">Enter Grades</a>
                <a href="/dashboard/assessments/new" className="btn btn-outline btn-sm">Create Assessment</a>
                <a href="/dashboard/students" className="btn btn-outline btn-sm">My Students</a>
              </>
            )}
            {user.role === "STUDENT" && (
              <>
                <a href="/dashboard/timetable" className="btn btn-outline btn-sm">My Timetable</a>
                <a href="/dashboard/grades" className="btn btn-outline btn-sm">My Grades</a>
                <a href="/dashboard/attendance" className="btn btn-outline btn-sm">My Attendance</a>
                <a href="/dashboard/assessments" className="btn btn-outline btn-sm">Assessments</a>
              </>
            )}
            {user.role === "PARENT" && (
              <>
                <a href="/dashboard/children" className="btn btn-outline btn-sm">My Children</a>
                <a href="/dashboard/fees" className="btn btn-outline btn-sm">Fee Status</a>
                <a href="/dashboard/attendance" className="btn btn-outline btn-sm">Attendance</a>
              </>
            )}
            {user.role === "ACCOUNTANT" && (
              <>
                <a href="/dashboard/fees" className="btn btn-outline btn-sm">Fee Management</a>
                <a href="/dashboard/invoices" className="btn btn-outline btn-sm">Invoices</a>
                <a href="/dashboard/payments" className="btn btn-outline btn-sm">Payments</a>
                <a href="/dashboard/reports/finance" className="btn btn-outline btn-sm">Finance Reports</a>
              </>
            )}
          </div>
        </div>

        {/* Debug info - remove this in production */}
        <div className="mt-8 p-4 bg-yellow-100 text-yellow-800 rounded-lg text-sm">
          <details>
            <summary className="font-semibold cursor-pointer">Debug Info (click to expand)</summary>
            <pre className="mt-2 text-xs overflow-auto">
              {JSON.stringify({ user, stats }, null, 2)}
            </pre>
          </details>
        </div>
      </div>
    </div>
  );
}