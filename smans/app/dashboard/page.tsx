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

  // Initialize stats object
  let stats: any = {};

  try {
    // Fetch data based on role - only what's needed
    switch (userRole) {
      case "ADMIN": {
        // Admin sees everything
        const [
          students,
          teachers,
          parents,
          classes,
          subjects,
          assignments,
          assessments,
          exams,
          feeItems,
          pendingInvoices,
          totalInvoices,
          totalPayments,
          presentAttendance,
          totalNotifications,
          unreadNotifications,
        ] = await Promise.all([
          prisma.student.count(),
          prisma.user.count({ where: { role: "TEACHER" } }),
          prisma.parent.count(),
          prisma.class.count(),
          prisma.subject.count(),
          prisma.assignment.count(),
          prisma.assessment.count(),
          prisma.exam.count(),
          prisma.feeItem.count(),
          prisma.invoice.count({ where: { status: "PENDING" } }),
          prisma.invoice.count(),
          prisma.payment.count(),
          prisma.attendance.count({
            where: {
              date: {
                gte: new Date(new Date().setHours(0, 0, 0, 0)),
              },
              status: "PRESENT",
            },
          }),
          prisma.notification.count({
            where: { userId: user.id },
          }),
          prisma.notification.count({
            where: { 
              userId: user.id,
              read: false,
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

        // Get recent parents for the quick view
        const recentParents = await prisma.parent.findMany({
          take: 5,
          orderBy: { createdAt: "desc" },
          include: {
            _count: {
              select: {
                students: true,
              },
            },
          },
        });

        stats = {
          totalStudents: students,
          totalTeachers: teachers,
          totalParents: parents,
          totalClasses: classes,
          totalSubjects: subjects,
          totalAssignments: assignments,
          totalAssessments: assessments,
          totalExams: exams,
          totalFeeItems: feeItems,
          pendingInvoices: pendingInvoices,
          totalInvoices: totalInvoices,
          totalPayments: totalPayments,
          attendanceRate: totalAttendanceToday > 0 
            ? Math.round((presentAttendance / totalAttendanceToday) * 100) 
            : 0,
          totalNotifications: totalNotifications,
          unreadNotifications: unreadNotifications,
          recentParents: recentParents,
        };
        break;
      }

      case "TEACHER": {
        // Teacher sees their classes and related stats
        const teacherClasses = await prisma.class.findMany({
          where: { teacherId: user.id },
          include: {
            _count: {
              select: {
                students: true,
                assignments: true,
                assessments: true,
              },
            },
          },
        });
        
        const totalStudents = teacherClasses.reduce((acc, cls) => acc + cls._count.students, 0);
        const totalAssignments = teacherClasses.reduce((acc, cls) => acc + cls._count.assignments, 0);
        const totalAssessments = teacherClasses.reduce((acc, cls) => acc + cls._count.assessments, 0);
        
        const [teacherNotifications, teacherUnread] = await Promise.all([
          prisma.notification.count({
            where: { userId: user.id },
          }),
          prisma.notification.count({
            where: { 
              userId: user.id,
              read: false,
            },
          }),
        ]);
        
        stats = {
          teacherClasses: teacherClasses.length,
          totalStudents,
          totalAssignments,
          totalAssessments,
          classes: teacherClasses,
          totalNotifications: teacherNotifications,
          unreadNotifications: teacherUnread,
        };
        break;
      }

      case "STUDENT": {
        // Student sees their personal data
        const student = await prisma.student.findFirst({
          where: { userId: user.id },
          include: {
            class: {
              include: {
                subjects: true,
              },
            },
            grades: {
              take: 5,
              orderBy: { createdAt: "desc" },
              include: { 
                subject: true,
                exam: true,
              },
            },
            attendance: {
              where: {
                date: {
                  gte: new Date(new Date().setDate(new Date().getDate() - 30)),
                },
              },
              orderBy: { date: "desc" },
              take: 10,
            },
            invoices: {
              where: {
                status: {
                  in: ["PENDING", "PARTIAL", "OVERDUE"],
                },
              },
              orderBy: { dueDate: "asc" },
            },
          },
        });

        const [studentNotifications, studentUnread] = await Promise.all([
          prisma.notification.count({
            where: { userId: user.id },
          }),
          prisma.notification.count({
            where: { 
              userId: user.id,
              read: false,
            },
          }),
        ]);

        // Calculate attendance rate for last 30 days
        let attendanceRate = 0;
        if (student?.attendance && student.attendance.length > 0) {
          const presentCount = student.attendance.filter(a => a.status === "PRESENT").length;
          attendanceRate = Math.round((presentCount / student.attendance.length) * 100);
        }

        stats = {
          student,
          attendanceRate,
          pendingInvoices: student?.invoices?.length || 0,
          totalNotifications: studentNotifications,
          unreadNotifications: studentUnread,
        };
        break;
      }

      case "PARENT": {
        // Parent sees their children's data
        const children = await prisma.student.findMany({
          where: { parent: { userId: user.id } },
          include: { 
            class: {
              include: {
                subjects: true,
              },
            },
            grades: {
              take: 5,
              orderBy: { createdAt: "desc" },
              include: { subject: true },
            },
            attendance: {
              where: {
                date: {
                  gte: new Date(new Date().setDate(new Date().getDate() - 7)),
                },
              },
            },
            invoices: {
              where: {
                status: {
                  in: ["PENDING", "PARTIAL", "OVERDUE"],
                },
              },
            },
          },
        });

        const [parentNotifications, parentUnread] = await Promise.all([
          prisma.notification.count({
            where: { userId: user.id },
          }),
          prisma.notification.count({
            where: { 
              userId: user.id,
              read: false,
            },
          }),
        ]);

        // Calculate total pending invoices for all children
        const totalPendingInvoices = children.reduce((acc, child) => acc + (child.invoices?.length || 0), 0);

        stats = {
          children,
          totalChildren: children.length,
          totalPendingInvoices,
          totalNotifications: parentNotifications,
          unreadNotifications: parentUnread,
        };
        break;
      }

      case "ACCOUNTANT": {
        // Accountant sees financial data
        const financialData = await Promise.all([
          prisma.invoice.aggregate({
            where: { status: "PENDING" },
            _sum: { amount: true },
            _count: true,
          }),
          prisma.invoice.aggregate({
            where: { status: "PAID" },
            _sum: { amount: true },
            _count: true,
          }),
          prisma.invoice.aggregate({
            where: { status: "OVERDUE" },
            _sum: { amount: true },
            _count: true,
          }),
          prisma.payment.aggregate({
            _sum: { amount: true },
            where: {
              paymentDate: {
                gte: new Date(new Date().setDate(new Date().getDate() - 30)),
              },
            },
          }),
          prisma.invoice.count(),
          prisma.payment.count(),
          prisma.feeItem.count(),
        ]);
        
        const [pending, paid, overdue, recentPayments, totalInvoicesCount, totalPaymentsCount, totalFeeItems] = financialData;

        const [accountantNotifications, accountantUnread] = await Promise.all([
          prisma.notification.count({
            where: { userId: user.id },
          }),
          prisma.notification.count({
            where: { 
              userId: user.id,
              read: false,
            },
          }),
        ]);

        stats = {
          pendingAmount: pending._sum.amount || 0,
          pendingCount: pending._count,
          paidAmount: paid._sum.amount || 0,
          paidCount: paid._count,
          overdueAmount: overdue._sum.amount || 0,
          overdueCount: overdue._count,
          recentPaymentsAmount: recentPayments._sum.amount || 0,
          totalInvoices: totalInvoicesCount,
          totalPayments: totalPaymentsCount,
          totalFeeItems,
          totalNotifications: accountantNotifications,
          unreadNotifications: accountantUnread,
        };
        break;
      }

      default:
        stats = {};
    }
  } catch (error) {
    console.error("Failed to fetch dashboard stats:", error);
  }

  // Render the dashboard based on role
  return (
    <div className="min-h-screen p-6 md:p-8 bg-base-100">
      <div className="max-w-7xl mx-auto">
        {/* Header - Common for all roles */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-primary">Dashboard</h1>
          <p className="text-base-content/70 mt-2 text-lg">
            Welcome back, <span className="font-semibold">{user.name || user.email}</span>!
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            <span className="inline-flex items-center px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium">
              Role: {userRole}
            </span>
            {stats.unreadNotifications > 0 && (
              <span className="inline-flex items-center px-4 py-1.5 bg-error/10 text-error rounded-full text-sm font-medium">
                🔔 {stats.unreadNotifications} unread notifications
              </span>
            )}
          </div>
        </div>

        {/* Role-Specific Dashboard Content */}
        {userRole === "ADMIN" && <AdminDashboard stats={stats} />}
        {userRole === "TEACHER" && <TeacherDashboard stats={stats} />}
        {userRole === "STUDENT" && <StudentDashboard stats={stats} />}
        {userRole === "PARENT" && <ParentDashboard stats={stats} />}
        {userRole === "ACCOUNTANT" && <AccountantDashboard stats={stats} />}
      </div>
    </div>
  );
}

// Admin Dashboard Component
function AdminDashboard({ stats }: { stats: any }) {
  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-base-200 rounded-2xl p-6 border border-base-300 hover:shadow-lg transition-shadow">
          <div className="text-5xl font-bold text-primary">{stats.totalStudents || 0}</div>
          <div className="text-base-content/60 mt-1">Total Students</div>
        </div>

        <div className="bg-base-200 rounded-2xl p-6 border border-base-300 hover:shadow-lg transition-shadow">
          <div className="text-5xl font-bold text-primary">{stats.totalTeachers || 0}</div>
          <div className="text-base-content/60 mt-1">Total Teachers</div>
        </div>

        <div className="bg-base-200 rounded-2xl p-6 border border-base-300 hover:shadow-lg transition-shadow">
          <div className="text-5xl font-bold text-primary">{stats.totalParents || 0}</div>
          <div className="text-base-content/60 mt-1">Total Parents</div>
        </div>

        <div className="bg-base-200 rounded-2xl p-6 border border-base-300 hover:shadow-lg transition-shadow">
          <div className="text-5xl font-bold text-primary">{stats.totalClasses || 0}</div>
          <div className="text-base-content/60 mt-1">Total Classes</div>
        </div>
      </div>

      {/* Additional Admin Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-base-200 rounded-2xl p-6 border border-base-300 hover:shadow-lg transition-shadow">
          <div className="text-4xl font-bold text-primary">{stats.totalSubjects || 0}</div>
          <div className="text-base-content/60 mt-1 text-sm">Subjects</div>
        </div>
        <div className="bg-base-200 rounded-2xl p-6 border border-base-300 hover:shadow-lg transition-shadow">
          <div className="text-4xl font-bold text-primary">{stats.totalAssignments || 0}</div>
          <div className="text-base-content/60 mt-1 text-sm">Assignments</div>
        </div>
        <div className="bg-base-200 rounded-2xl p-6 border border-base-300 hover:shadow-lg transition-shadow">
          <div className="text-4xl font-bold text-primary">{stats.totalAssessments || 0}</div>
          <div className="text-base-content/60 mt-1 text-sm">Assessments</div>
        </div>
        <div className="bg-base-200 rounded-2xl p-6 border border-base-300 hover:shadow-lg transition-shadow">
          <div className="text-4xl font-bold text-primary">{stats.totalExams || 0}</div>
          <div className="text-base-content/60 mt-1 text-sm">Exams</div>
        </div>
        <div className="bg-base-200 rounded-2xl p-6 border border-base-300 hover:shadow-lg transition-shadow">
          <div className="text-4xl font-bold text-primary">{stats.totalFeeItems || 0}</div>
          <div className="text-base-content/60 mt-1 text-sm">Fee Items</div>
        </div>
        <div className="bg-base-200 rounded-2xl p-6 border border-base-300 hover:shadow-lg transition-shadow">
          <div className="text-4xl font-bold text-primary">{stats.totalInvoices || 0}</div>
          <div className="text-base-content/60 mt-1 text-sm">Total Invoices</div>
        </div>
        <div className="bg-base-200 rounded-2xl p-6 border border-base-300 hover:shadow-lg transition-shadow">
          <div className="text-4xl font-bold text-primary">{stats.pendingInvoices || 0}</div>
          <div className="text-base-content/60 mt-1 text-sm">Pending Invoices</div>
        </div>
        <div className="bg-base-200 rounded-2xl p-6 border border-base-300 hover:shadow-lg transition-shadow">
          <div className="text-4xl font-bold text-primary">{stats.totalPayments || 0}</div>
          <div className="text-base-content/60 mt-1 text-sm">Payments</div>
        </div>
      </div>

      {/* Admin Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="bg-base-200 rounded-2xl p-6 border border-base-300">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <a href="/dashboard/students/new" className="btn btn-sm btn-outline w-full">Add New Student</a>
            <a href="/dashboard/teachers/new" className="btn btn-sm btn-outline w-full">Add New Teacher</a>
            <a href="/dashboard/parents/new" className="btn btn-sm btn-outline w-full">Add New Parent</a>
            <a href="/dashboard/classes/new" className="btn btn-sm btn-outline w-full">Create Class</a>
            <a href="/dashboard/subjects/new" className="btn btn-sm btn-outline w-full">Create Subject</a>
            <a href="/dashboard/fees/structure/new" className="btn btn-sm btn-outline w-full">Create Fee Item</a>
            <a href="/dashboard/exams/create" className="btn btn-sm btn-outline w-full">Create Exam</a>
            <a href="/dashboard/assignments/create" className="btn btn-sm btn-outline w-full">Create Assignment</a>
            <a href="/dashboard/assessments/create" className="btn btn-sm btn-outline w-full">Create Assessment</a>
          </div>
        </div>
        <div className="bg-base-200 rounded-2xl p-6 border border-base-300">
          <h3 className="text-lg font-semibold mb-4">System Overview</h3>
          <div className="space-y-2 text-sm">
            <p className="text-base-content/60">📚 {stats.totalAssignments || 0} assignments created</p>
            <p className="text-base-content/60">📝 {stats.totalAssessments || 0} assessments scheduled</p>
            <p className="text-base-content/60">📊 {stats.totalExams || 0} exams conducted</p>
            <p className="text-base-content/60">💰 {stats.pendingInvoices || 0} pending invoices</p>
            <p className="text-base-content/60">📋 {stats.totalFeeItems || 0} fee items configured</p>
            <p className="text-base-content/60">👨‍🎓 {stats.totalStudents || 0} students enrolled</p>
            <p className="text-base-content/60">👨‍🏫 {stats.totalTeachers || 0} teachers employed</p>
            <p className="text-base-content/60">👨‍👩‍👧‍👦 {stats.totalParents || 0} parents registered</p>
            <p className="text-base-content/60">📐 {stats.totalSubjects || 0} subjects offered</p>
            <p className="text-base-content/60">🏫 {stats.totalClasses || 0} classes active</p>
          </div>
        </div>
      </div>

      {/* Recent Parents Section */}
      <div className="bg-base-200 rounded-2xl p-6 border border-base-300 mb-10">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Recent Parents</h3>
          <a href="/dashboard/parents" className="btn btn-sm btn-primary">View All Parents</a>
        </div>
        {stats.recentParents && stats.recentParents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Children</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentParents.map((parent: any) => (
                  <tr key={parent.id}>
                    <td className="font-medium">{parent.name}</td>
                    <td>{parent.email || 'N/A'}</td>
                    <td>{parent.phone || 'N/A'}</td>
                    <td>
                      <span className="badge badge-primary badge-sm">
                        {parent._count.students}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-1">
                        <a 
                          href={`/dashboard/parents/${parent.id}`} 
                          className="btn btn-xs btn-ghost"
                        >
                          View
                        </a>
                        <a 
                          href={`/dashboard/parents/${parent.id}/edit`} 
                          className="btn btn-xs btn-ghost"
                        >
                          Edit
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-base-content/60">No parents registered yet.</p>
        )}
      </div>

      {/* Quick Links - Enhanced with ALL sections */}
      <div className="bg-base-200 rounded-2xl p-8 border border-base-300">
        <h2 className="text-2xl font-semibold mb-6">Quick Links</h2>
        
        {/* Row 1: Core Management */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <h3 className="col-span-full text-sm font-semibold text-primary/60 uppercase tracking-wider mb-2">
            Core Management
          </h3>
          <a href="/dashboard/students" className="btn btn-outline">Manage Students</a>
          <a href="/dashboard/teachers" className="btn btn-outline">Manage Teachers</a>
          <a href="/dashboard/parents" className="btn btn-outline">Manage Parents</a>
          <a href="/dashboard/classes" className="btn btn-outline">Manage Classes</a>
        </div>

        {/* Row 2: Academic Management */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <h3 className="col-span-full text-sm font-semibold text-primary/60 uppercase tracking-wider mb-2">
            Academic Management
          </h3>
          <a href="/dashboard/subjects" className="btn btn-outline">Subjects</a>
          <a href="/dashboard/assignments" className="btn btn-outline">Assignments</a>
          <a href="/dashboard/assessments" className="btn btn-outline">Assessments</a>
          <a href="/dashboard/exams" className="btn btn-outline">Exams</a>
        </div>

        {/* Row 3: Grades & Attendance */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <h3 className="col-span-full text-sm font-semibold text-primary/60 uppercase tracking-wider mb-2">
            Grades & Attendance
          </h3>
          <a href="/dashboard/grades" className="btn btn-outline">View Grades</a>
          <a href="/dashboard/grades/enter" className="btn btn-outline">Enter Grades</a>
          <a href="/dashboard/attendance" className="btn btn-outline">View Attendance</a>
          <a href="/dashboard/attendance/mark" className="btn btn-outline">Mark Attendance</a>
        </div>

        {/* Row 4: Fees & Finance */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <h3 className="col-span-full text-sm font-semibold text-primary/60 uppercase tracking-wider mb-2">
            Fees & Finance
          </h3>
          <a href="/dashboard/fees" className="btn btn-outline">Fee Management</a>
          <a href="/dashboard/fees/structure" className="btn btn-outline">Fee Structure</a>
          <a href="/dashboard/invoices" className="btn btn-outline">Invoices</a>
          <a href="/dashboard/payments" className="btn btn-outline">Payments</a>
        </div>

        {/* Row 5: Reports & Settings */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <h3 className="col-span-full text-sm font-semibold text-primary/60 uppercase tracking-wider mb-2">
            Reports & Settings
          </h3>
          <a href="/dashboard/reports" className="btn btn-outline">All Reports</a>
          <a href="/dashboard/reports/academic" className="btn btn-outline">Academic Reports</a>
          <a href="/dashboard/reports/financial" className="btn btn-outline">Financial Reports</a>
          <a href="/dashboard/notifications" className="btn btn-outline">Notifications</a>
          <a href="/dashboard/settings" className="btn btn-outline">System Settings</a>
          <a href="/dashboard/timetable" className="btn btn-outline">Timetable</a>
          <a href="/dashboard/profile" className="btn btn-outline">My Profile</a>
        </div>
      </div>
    </>
  );
}

// Teacher Dashboard Component
function TeacherDashboard({ stats }: { stats: any }) {
  return (
    <>
      {/* Teacher Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-base-200 rounded-2xl p-6 border border-base-300 hover:shadow-lg transition-shadow">
          <div className="text-4xl font-bold text-primary">{stats.teacherClasses || 0}</div>
          <div className="text-base-content/60 mt-1">My Classes</div>
        </div>
        <div className="bg-base-200 rounded-2xl p-6 border border-base-300 hover:shadow-lg transition-shadow">
          <div className="text-4xl font-bold text-primary">{stats.totalStudents || 0}</div>
          <div className="text-base-content/60 mt-1">My Students</div>
        </div>
        <div className="bg-base-200 rounded-2xl p-6 border border-base-300 hover:shadow-lg transition-shadow">
          <div className="text-4xl font-bold text-primary">{stats.totalAssignments || 0}</div>
          <div className="text-base-content/60 mt-1">My Assignments</div>
        </div>
        <div className="bg-base-200 rounded-2xl p-6 border border-base-300 hover:shadow-lg transition-shadow">
          <div className="text-4xl font-bold text-primary">{stats.totalAssessments || 0}</div>
          <div className="text-base-content/60 mt-1">My Assessments</div>
        </div>
      </div>

      {/* Teacher Classes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="bg-base-200 rounded-2xl p-6 border border-base-300">
          <h3 className="text-lg font-semibold mb-4">My Classes</h3>
          {stats.classes && stats.classes.length > 0 ? (
            <div className="space-y-2">
              {stats.classes.map((cls: any) => (
                <div key={cls.id} className="flex justify-between items-center border-b pb-2">
                  <span className="font-medium">{cls.name}</span>
                  <span className="text-sm text-base-content/60">
                    {cls._count.students} students
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-base-content/60">No classes assigned yet.</p>
          )}
        </div>
        <div className="bg-base-200 rounded-2xl p-6 border border-base-300">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <a href="/dashboard/attendance/mark" className="btn btn-sm btn-outline w-full">Mark Attendance</a>
            <a href="/dashboard/grades/enter" className="btn btn-sm btn-outline w-full">Enter Grades</a>
            <a href="/dashboard/assignments/create" className="btn btn-sm btn-outline w-full">Create Assignment</a>
            <a href="/dashboard/assessments/create" className="btn btn-sm btn-outline w-full">Create Assessment</a>
            <a href="/dashboard/exams/create" className="btn btn-sm btn-outline w-full">Create Exam</a>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-base-200 rounded-2xl p-8 border border-base-300">
        <h2 className="text-2xl font-semibold mb-6">Quick Links</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <a href="/dashboard/students" className="btn btn-outline">My Students</a>
          <a href="/dashboard/classes" className="btn btn-outline">My Classes</a>
          <a href="/dashboard/timetable" className="btn btn-outline">My Timetable</a>
          <a href="/dashboard/attendance" className="btn btn-outline">Attendance</a>
          <a href="/dashboard/grades" className="btn btn-outline">Grades</a>
          <a href="/dashboard/assignments" className="btn btn-outline">Assignments</a>
          <a href="/dashboard/assessments" className="btn btn-outline">Assessments</a>
          <a href="/dashboard/profile" className="btn btn-outline">My Profile</a>
        </div>
      </div>
    </>
  );
}

// Student Dashboard Component
function StudentDashboard({ stats }: { stats: any }) {
  const student = stats.student;
  
  return (
    <>
      {/* Student Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-base-200 rounded-2xl p-6 border border-base-300 hover:shadow-lg transition-shadow">
          <div className="text-4xl font-bold text-primary">{student?.class?.name || 'N/A'}</div>
          <div className="text-base-content/60 mt-1 text-sm">Current Class</div>
        </div>
        <div className="bg-base-200 rounded-2xl p-6 border border-base-300 hover:shadow-lg transition-shadow">
          <div className="text-4xl font-bold text-primary">{stats.attendanceRate || 0}%</div>
          <div className="text-base-content/60 mt-1 text-sm">Attendance Rate (30 days)</div>
        </div>
        <div className="bg-base-200 rounded-2xl p-6 border border-base-300 hover:shadow-lg transition-shadow">
          <div className="text-4xl font-bold text-primary">{stats.pendingInvoices || 0}</div>
          <div className="text-base-content/60 mt-1 text-sm">Pending Invoices</div>
        </div>
        <div className="bg-base-200 rounded-2xl p-6 border border-base-300 hover:shadow-lg transition-shadow">
          <div className="text-4xl font-bold text-primary">{student?.grades?.length || 0}</div>
          <div className="text-base-content/60 mt-1 text-sm">Total Grades</div>
        </div>
      </div>

      {/* Student Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="bg-base-200 rounded-2xl p-6 border border-base-300">
          <h3 className="text-lg font-semibold mb-4">Recent Grades</h3>
          {student?.grades && student.grades.length > 0 ? (
            <div className="space-y-2">
              {student.grades.map((grade: any) => (
                <div key={grade.id} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <span className="font-medium">{grade.subject?.name || 'Unknown Subject'}</span>
                    {grade.exam && (
                      <span className="text-xs text-base-content/60 ml-2">
                        {grade.exam.name}
                      </span>
                    )}
                  </div>
                  <span className="font-medium">
                    {grade.marks}/{grade.maxMarks}
                    {grade.weightedScore && (
                      <span className="text-xs text-base-content/60 ml-1">
                        ({grade.weightedScore}%)
                      </span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-base-content/60">No grades recorded yet.</p>
          )}
        </div>
        <div className="bg-base-200 rounded-2xl p-6 border border-base-300">
          <h3 className="text-lg font-semibold mb-4">Recent Attendance</h3>
          {student?.attendance && student.attendance.length > 0 ? (
            <div className="flex gap-2 flex-wrap">
              {student.attendance.slice(0, 10).map((att: any) => (
                <div key={att.id} className="text-center">
                  <span className={`badge ${att.status === 'PRESENT' ? 'badge-success' : 'badge-error'}`}>
                    {att.status}
                  </span>
                  <span className="text-xs block text-base-content/60">
                    {new Date(att.date).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-base-content/60">No attendance records found.</p>
          )}
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-base-200 rounded-2xl p-8 border border-base-300">
        <h2 className="text-2xl font-semibold mb-6">Quick Links</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <a href="/dashboard/grades" className="btn btn-outline">My Grades</a>
          <a href="/dashboard/attendance" className="btn btn-outline">My Attendance</a>
          <a href="/dashboard/timetable" className="btn btn-outline">My Timetable</a>
          <a href="/dashboard/fees" className="btn btn-outline">My Fees</a>
          <a href="/dashboard/assignments" className="btn btn-outline">My Assignments</a>
          <a href="/dashboard/exams" className="btn btn-outline">My Exams</a>
          <a href="/dashboard/profile" className="btn btn-outline">My Profile</a>
        </div>
      </div>
    </>
  );
}

// Parent Dashboard Component
function ParentDashboard({ stats }: { stats: any }) {
  return (
    <>
      {/* Parent Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <div className="bg-base-200 rounded-2xl p-6 border border-base-300 hover:shadow-lg transition-shadow">
          <div className="text-4xl font-bold text-primary">{stats.totalChildren || 0}</div>
          <div className="text-base-content/60 mt-1">My Children</div>
        </div>
        <div className="bg-base-200 rounded-2xl p-6 border border-base-300 hover:shadow-lg transition-shadow">
          <div className="text-4xl font-bold text-primary">{stats.totalPendingInvoices || 0}</div>
          <div className="text-base-content/60 mt-1">Pending Invoices</div>
        </div>
        <div className="bg-base-200 rounded-2xl p-6 border border-base-300 hover:shadow-lg transition-shadow">
          <div className="text-4xl font-bold text-primary">{stats.totalNotifications || 0}</div>
          <div className="text-base-content/60 mt-1">Notifications</div>
        </div>
      </div>

      {/* Children Details */}
      <div className="bg-base-200 rounded-2xl p-6 border border-base-300 mb-10">
        <h3 className="text-lg font-semibold mb-4">My Children</h3>
        {stats.children && stats.children.length > 0 ? (
          <div className="space-y-4">
            {stats.children.map((child: any) => (
              <div key={child.id} className="border-b pb-4 last:border-0">
                <div className="flex flex-wrap justify-between items-start">
                  <div>
                    <p className="font-semibold text-lg">{child.name}</p>
                    <p className="text-sm text-base-content/60">
                      Class: {child.class?.name || 'No class'} • 
                      Admission: {child.admissionNumber}
                    </p>
                    <p className="text-sm text-base-content/60">
                      Pending Invoices: <span className="text-error font-medium">
                        {child.invoices?.length || 0}
                      </span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-base-content/60">Recent Grades</p>
                    {child.grades && child.grades.length > 0 ? (
                      <div className="text-sm">
                        {child.grades.slice(0, 3).map((grade: any) => (
                          <div key={grade.id}>
                            {grade.subject?.name}: {grade.marks}/{grade.maxMarks}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-base-content/60">No grades</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-base-content/60">No children linked to your account.</p>
        )}
      </div>

      {/* Quick Links */}
      <div className="bg-base-200 rounded-2xl p-8 border border-base-300">
        <h2 className="text-2xl font-semibold mb-6">Quick Links</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <a href="/dashboard/children" className="btn btn-outline">My Children</a>
          <a href="/dashboard/attendance" className="btn btn-outline">Attendance</a>
          <a href="/dashboard/fees" className="btn btn-outline">Fees</a>
          <a href="/dashboard/grades" className="btn btn-outline">Grades</a>
          <a href="/dashboard/notifications" className="btn btn-outline">Notifications</a>
          <a href="/dashboard/timetable" className="btn btn-outline">Timetable</a>
          <a href="/dashboard/profile" className="btn btn-outline">My Profile</a>
        </div>
      </div>
    </>
  );
}

// Accountant Dashboard Component
function AccountantDashboard({ stats }: { stats: any }) {
  return (
    <>
      {/* Accountant Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-base-200 rounded-2xl p-6 border border-base-300 hover:shadow-lg transition-shadow">
          <div className="text-4xl font-bold text-primary">{stats.totalInvoices || 0}</div>
          <div className="text-base-content/60 mt-1">Total Invoices</div>
        </div>
        <div className="bg-base-200 rounded-2xl p-6 border border-base-300 hover:shadow-lg transition-shadow">
          <div className="text-4xl font-bold text-primary">{stats.totalPayments || 0}</div>
          <div className="text-base-content/60 mt-1">Total Payments</div>
        </div>
        <div className="bg-base-200 rounded-2xl p-6 border border-base-300 hover:shadow-lg transition-shadow">
          <div className="text-4xl font-bold text-primary">{stats.totalFeeItems || 0}</div>
          <div className="text-base-content/60 mt-1">Fee Items</div>
        </div>
        <div className="bg-base-200 rounded-2xl p-6 border border-base-300 hover:shadow-lg transition-shadow">
          <div className="text-4xl font-bold text-primary">{stats.pendingCount || 0}</div>
          <div className="text-base-content/60 mt-1">Pending Invoices</div>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="bg-base-200 rounded-2xl p-6 border border-base-300">
          <h3 className="text-lg font-semibold mb-4">Financial Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-base-content/60">Pending Invoices</span>
              <div className="text-right">
                <p className="text-xl font-semibold text-warning">{stats.pendingCount || 0}</p>
                <p className="text-sm text-base-content/60">KSh {(stats.pendingAmount || 0).toLocaleString()}</p>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-base-content/60">Paid Invoices</span>
              <div className="text-right">
                <p className="text-xl font-semibold text-success">{stats.paidCount || 0}</p>
                <p className="text-sm text-base-content/60">KSh {(stats.paidAmount || 0).toLocaleString()}</p>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-base-content/60">Overdue Invoices</span>
              <div className="text-right">
                <p className="text-xl font-semibold text-error">{stats.overdueCount || 0}</p>
                <p className="text-sm text-base-content/60">KSh {(stats.overdueAmount || 0).toLocaleString()}</p>
              </div>
            </div>
            <div className="border-t pt-3">
              <div className="flex justify-between items-center">
                <span className="text-base-content/60">Recent Payments (30 days)</span>
                <p className="text-xl font-semibold text-primary">
                  KSh {(stats.recentPaymentsAmount || 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-base-200 rounded-2xl p-6 border border-base-300">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <a href="/dashboard/invoices/new" className="btn btn-sm btn-outline w-full">Create Invoice</a>
            <a href="/dashboard/invoices" className="btn btn-sm btn-outline w-full">View All Invoices</a>
            <a href="/dashboard/payments" className="btn btn-sm btn-outline w-full">Record Payment</a>
            <a href="/dashboard/fees/structure" className="btn btn-sm btn-outline w-full">Manage Fee Items</a>
            <a href="/dashboard/fees/structure/new" className="btn btn-sm btn-outline w-full">Add Fee Item</a>
            <a href="/dashboard/reports/financial" className="btn btn-sm btn-outline w-full">Financial Reports</a>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-base-200 rounded-2xl p-8 border border-base-300">
        <h2 className="text-2xl font-semibold mb-6">Quick Links</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <a href="/dashboard/fees" className="btn btn-outline">Fee Management</a>
          <a href="/dashboard/fees/structure" className="btn btn-outline">Fee Structure</a>
          <a href="/dashboard/invoices" className="btn btn-outline">Invoices</a>
          <a href="/dashboard/payments" className="btn btn-outline">Payments</a>
          <a href="/dashboard/reports/financial" className="btn btn-outline">Financial Reports</a>
          <a href="/dashboard/profile" className="btn btn-outline">My Profile</a>
        </div>
      </div>
    </>
  );
}