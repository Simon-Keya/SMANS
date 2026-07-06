// app/dashboard/components/TeacherDashboard.tsx
"use client";

interface TeacherDashboardProps {
  stats: any;
}

export function TeacherDashboard({ stats }: TeacherDashboardProps) {
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