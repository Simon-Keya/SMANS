// app/dashboard/components/AdminDashboard.tsx
"use client";

interface AdminDashboardProps {
  stats: any;
}

export function AdminDashboard({ stats }: AdminDashboardProps) {
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

      {/* Quick Links */}
      <div className="bg-base-200 rounded-2xl p-8 border border-base-300">
        <h2 className="text-2xl font-semibold mb-6">Quick Links</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <h3 className="col-span-full text-sm font-semibold text-primary/60 uppercase tracking-wider mb-2">
            Core Management
          </h3>
          <a href="/dashboard/students" className="btn btn-outline">Manage Students</a>
          <a href="/dashboard/teachers" className="btn btn-outline">Manage Teachers</a>
          <a href="/dashboard/parents" className="btn btn-outline">Manage Parents</a>
          <a href="/dashboard/classes" className="btn btn-outline">Manage Classes</a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <h3 className="col-span-full text-sm font-semibold text-primary/60 uppercase tracking-wider mb-2">
            Academic Management
          </h3>
          <a href="/dashboard/subjects" className="btn btn-outline">Subjects</a>
          <a href="/dashboard/assignments" className="btn btn-outline">Assignments</a>
          <a href="/dashboard/assessments" className="btn btn-outline">Assessments</a>
          <a href="/dashboard/exams" className="btn btn-outline">Exams</a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <h3 className="col-span-full text-sm font-semibold text-primary/60 uppercase tracking-wider mb-2">
            Grades & Attendance
          </h3>
          <a href="/dashboard/grades" className="btn btn-outline">View Grades</a>
          <a href="/dashboard/grades/enter" className="btn btn-outline">Enter Grades</a>
          <a href="/dashboard/attendance" className="btn btn-outline">View Attendance</a>
          <a href="/dashboard/attendance/mark" className="btn btn-outline">Mark Attendance</a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <h3 className="col-span-full text-sm font-semibold text-primary/60 uppercase tracking-wider mb-2">
            Fees & Finance
          </h3>
          <a href="/dashboard/fees" className="btn btn-outline">Fee Management</a>
          <a href="/dashboard/fees/structure" className="btn btn-outline">Fee Structure</a>
          <a href="/dashboard/invoices" className="btn btn-outline">Invoices</a>
          <a href="/dashboard/payments" className="btn btn-outline">Payments</a>
        </div>

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