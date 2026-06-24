// app/dashboard/page.tsx
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function DashboardHome() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  const userRole = user.role as string;

  // Fetch stats based on role
  let stats = {
    totalStudents: 0,
    totalTeachers: 0,
    totalParents: 0,
    totalClasses: 0,
    totalAssignments: 0,
    totalAssessments: 0,
    pendingInvoices: 0,
    attendanceRate: 0,
  };

  try {
    // Parallel data fetching for better performance
    const [
      students,
      teachers,
      parents,
      classes,
      assignments,
      assessments,
      pendingInvoices,
      attendanceRate,
    ] = await Promise.all([
      prisma.student.count(),
      prisma.user.count({ where: { role: "TEACHER" } }),
      prisma.parent.count(),
      prisma.class.count(),
      prisma.assignment.count(),
      prisma.assessment.count(),
      prisma.invoice.count({ where: { status: "PENDING" } }),
      prisma.attendance.count({
        where: {
          date: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
          status: "PRESENT",
        },
      }),
    ]);

    // Get total attendance for today
    const totalAttendanceToday = await prisma.attendance.count({
      where: {
        date: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    });

    stats = {
      totalStudents: students,
      totalTeachers: teachers,
      totalParents: parents,
      totalClasses: classes,
      totalAssignments: assignments,
      totalAssessments: assessments,
      pendingInvoices: pendingInvoices,
      attendanceRate: totalAttendanceToday > 0 
        ? Math.round((attendanceRate / totalAttendanceToday) * 100) 
        : 0,
    };
  } catch (error) {
    console.error("Failed to fetch dashboard stats:", error);
  }

  // Get role-specific data
  let roleSpecificData = null;

  if (userRole === "TEACHER") {
    // Get teacher's classes count
    const teacherClasses = await prisma.class.count({
      where: { teacherId: user.id },
    });
    roleSpecificData = { teacherClasses };
  } else if (userRole === "STUDENT") {
    // Get student's grades summary
    const student = await prisma.student.findFirst({
      where: { userId: user.id },
      include: {
        grades: {
          take: 5,
          orderBy: { createdAt: "desc" },
          include: { subject: true },
        },
        attendance: {
          where: {
            date: {
              gte: new Date(new Date().setDate(new Date().getDate() - 30)),
            },
          },
        },
      },
    });
    roleSpecificData = { student };
  } else if (userRole === "PARENT") {
    // Get parent's children
    const children = await prisma.student.findMany({
      where: { parent: { userId: user.id } },
      include: { class: true },
    });
    roleSpecificData = { children };
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
            Role: {userRole}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-base-200 rounded-2xl p-6 border border-base-300 hover:shadow-lg transition-shadow">
            <div className="text-5xl font-bold text-primary">{stats.totalStudents}</div>
            <div className="text-base-content/60 mt-1">Total Students</div>
          </div>

          <div className="bg-base-200 rounded-2xl p-6 border border-base-300 hover:shadow-lg transition-shadow">
            <div className="text-5xl font-bold text-primary">{stats.totalTeachers}</div>
            <div className="text-base-content/60 mt-1">Total Teachers</div>
          </div>

          <div className="bg-base-200 rounded-2xl p-6 border border-base-300 hover:shadow-lg transition-shadow">
            <div className="text-5xl font-bold text-primary">{stats.totalParents}</div>
            <div className="text-base-content/60 mt-1">Total Parents</div>
          </div>

          <div className="bg-base-200 rounded-2xl p-6 border border-base-300 hover:shadow-lg transition-shadow">
            <div className="text-5xl font-bold text-primary">{stats.totalClasses}</div>
            <div className="text-base-content/60 mt-1">Total Classes</div>
          </div>

          {/* Additional stats for Admin */}
          {userRole === "ADMIN" && (
            <>
              <div className="bg-base-200 rounded-2xl p-6 border border-base-300 hover:shadow-lg transition-shadow">
                <div className="text-5xl font-bold text-primary">{stats.totalAssignments}</div>
                <div className="text-base-content/60 mt-1">Assignments</div>
              </div>
              <div className="bg-base-200 rounded-2xl p-6 border border-base-300 hover:shadow-lg transition-shadow">
                <div className="text-5xl font-bold text-primary">{stats.totalAssessments}</div>
                <div className="text-base-content/60 mt-1">Assessments</div>
              </div>
              <div className="bg-base-200 rounded-2xl p-6 border border-base-300 hover:shadow-lg transition-shadow">
                <div className="text-5xl font-bold text-primary">{stats.pendingInvoices}</div>
                <div className="text-base-content/60 mt-1">Pending Invoices</div>
              </div>
              <div className="bg-base-200 rounded-2xl p-6 border border-base-300 hover:shadow-lg transition-shadow">
                <div className="text-5xl font-bold text-primary">{stats.attendanceRate}%</div>
                <div className="text-base-content/60 mt-1">Attendance Rate</div>
              </div>
            </>
          )}
        </div>

        {/* Role-Specific Sections */}
        {userRole === "ADMIN" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <div className="bg-base-200 rounded-2xl p-6 border border-base-300">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <a href="/dashboard/students/new" className="btn btn-sm btn-outline w-full">Add New Student</a>
                <a href="/dashboard/teachers/new" className="btn btn-sm btn-outline w-full">Add New Teacher</a>
                <a href="/dashboard/classes/new" className="btn btn-sm btn-outline w-full">Create Class</a>
              </div>
            </div>
            <div className="bg-base-200 rounded-2xl p-6 border border-base-300">
              <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
              <div className="space-y-2 text-sm">
                <p className="text-base-content/60">📚 {stats.totalAssignments} assignments created</p>
                <p className="text-base-content/60">📝 {stats.totalAssessments} assessments scheduled</p>
                <p className="text-base-content/60">💰 {stats.pendingInvoices} pending invoices</p>
              </div>
            </div>
          </div>
        )}

        {userRole === "TEACHER" && roleSpecificData && (
          <div className="bg-base-200 rounded-2xl p-6 border border-base-300 mb-10">
            <h3 className="text-lg font-semibold mb-4">Your Classes</h3>
            <p className="text-2xl font-bold text-primary">{roleSpecificData.teacherClasses}</p>
            <p className="text-base-content/60">Classes assigned to you</p>
          </div>
        )}

        {userRole === "STUDENT" && roleSpecificData?.student && (
          <div className="bg-base-200 rounded-2xl p-6 border border-base-300 mb-10">
            <h3 className="text-lg font-semibold mb-4">Your Recent Grades</h3>
            {roleSpecificData.student.grades.length > 0 ? (
              <div className="space-y-2">
                {roleSpecificData.student.grades.map((grade: any) => (
                  <div key={grade.id} className="flex justify-between items-center border-b pb-2">
                    <span>{grade.subject.name}</span>
                    <span className="font-medium">{grade.marks}/{grade.maxMarks}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-base-content/60">No grades recorded yet.</p>
            )}
          </div>
        )}

        {userRole === "PARENT" && roleSpecificData?.children && (
          <div className="bg-base-200 rounded-2xl p-6 border border-base-300 mb-10">
            <h3 className="text-lg font-semibold mb-4">Your Children</h3>
            {roleSpecificData.children.length > 0 ? (
              <div className="space-y-2">
                {roleSpecificData.children.map((child: any) => (
                  <div key={child.id} className="flex justify-between items-center border-b pb-2">
                    <span>{child.name}</span>
                    <span className="text-sm text-base-content/60">{child.class?.name || "No class"}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-base-content/60">No children linked to your account.</p>
            )}
          </div>
        )}

        {/* Quick Links */}
        <div className="bg-base-200 rounded-2xl p-8 border border-base-300">
          <h2 className="text-2xl font-semibold mb-6">Quick Links</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {userRole === "ADMIN" && (
              <>
                <a href="/dashboard/students" className="btn btn-outline">Manage Students</a>
                <a href="/dashboard/teachers" className="btn btn-outline">Manage Teachers</a>
                <a href="/dashboard/classes" className="btn btn-outline">Classes</a>
                <a href="/dashboard/fees" className="btn btn-outline">Fees</a>
                <a href="/dashboard/reports" className="btn btn-outline">Reports</a>
              </>
            )}

            {userRole === "TEACHER" && (
              <>
                <a href="/dashboard/attendance/mark" className="btn btn-outline">Mark Attendance</a>
                <a href="/dashboard/grades/enter" className="btn btn-outline">Enter Grades</a>
                <a href="/dashboard/students" className="btn btn-outline">My Students</a>
                <a href="/dashboard/classes" className="btn btn-outline">My Classes</a>
              </>
            )}

            {userRole === "STUDENT" && (
              <>
                <a href="/dashboard/grades" className="btn btn-outline">My Grades</a>
                <a href="/dashboard/attendance" className="btn btn-outline">My Attendance</a>
                <a href="/dashboard/timetable" className="btn btn-outline">My Timetable</a>
              </>
            )}

            {userRole === "PARENT" && (
              <>
                <a href="/dashboard/children" className="btn btn-outline">My Children</a>
                <a href="/dashboard/attendance" className="btn btn-outline">Attendance</a>
                <a href="/dashboard/fees" className="btn btn-outline">Fees</a>
              </>
            )}

            {userRole === "ACCOUNTANT" && (
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