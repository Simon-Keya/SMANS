// app/dashboard/components/StudentDashboard.tsx
"use client";

interface StudentDashboardProps {
  stats: any;
}

export function StudentDashboard({ stats }: StudentDashboardProps) {
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