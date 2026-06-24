// app/dashboard/page.tsx - Enhanced version

import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function DashboardHome() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch stats safely
  let stats = {
    totalStudents: 0,
    totalTeachers: 0,
    totalParents: 0,
    totalClasses: 0,
  };

  try {
    const [students, teachers, parents, classes] = await Promise.all([
      prisma.student.count(),
      prisma.user.count({ where: { role: "TEACHER" } }),
      prisma.parent.count(),
      prisma.class.count(),
    ]);
    
    stats = { totalStudents: students, totalTeachers: teachers, totalParents: parents, totalClasses: classes };
  } catch (error) {
    console.error("Failed to fetch dashboard stats:", error);
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

        {/* Stats Cards - Added more stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-base-200 rounded-2xl p-6 border border-base-300">
            <div className="text-5xl font-bold text-primary">{stats.totalStudents}</div>
            <div className="text-base-content/60 mt-1">Total Students</div>
          </div>

          <div className="bg-base-200 rounded-2xl p-6 border border-base-300">
            <div className="text-5xl font-bold text-primary">{stats.totalTeachers}</div>
            <div className="text-base-content/60 mt-1">Total Teachers</div>
          </div>

          <div className="bg-base-200 rounded-2xl p-6 border border-base-300">
            <div className="text-5xl font-bold text-primary">{stats.totalParents}</div>
            <div className="text-base-content/60 mt-1">Total Parents</div>
          </div>

          <div className="bg-base-200 rounded-2xl p-6 border border-base-300">
            <div className="text-5xl font-bold text-primary">{stats.totalClasses}</div>
            <div className="text-base-content/60 mt-1">Total Classes</div>
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
                <a href="/dashboard/classes" className="btn btn-outline">My Classes</a>
              </>
            )}

            {user.role === "STUDENT" && (
              <>
                <a href="/dashboard/grades" className="btn btn-outline">My Grades</a>
                <a href="/dashboard/attendance" className="btn btn-outline">My Attendance</a>
                <a href="/dashboard/timetable" className="btn btn-outline">My Timetable</a>
              </>
            )}

            {user.role === "PARENT" && (
              <>
                <a href="/dashboard/children" className="btn btn-outline">My Children</a>
                <a href="/dashboard/attendance" className="btn btn-outline">Attendance</a>
                <a href="/dashboard/fees" className="btn btn-outline">Fees</a>
              </>
            )}

            {user.role === "ACCOUNTANT" && (
              <>
                <a href="/dashboard/fees" className="btn btn-outline">Fee Management</a>
                <a href="/dashboard/invoices" className="btn btn-outline">Invoices</a>
                <a href="/dashboard/payments" className="btn btn-outline">Payments</a>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}