// app/dashboard/components/ParentDashboard.tsx
"use client";

interface ParentDashboardProps {
  stats: any;
}

export function ParentDashboard({ stats }: ParentDashboardProps) {
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