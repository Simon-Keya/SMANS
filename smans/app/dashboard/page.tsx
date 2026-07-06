// app/dashboard/Homepage.tsx
import { getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import {
  AdminDashboard,
  TeacherDashboard,
  StudentDashboard,
  ParentDashboard,
  AccountantDashboard,
} from "@/components/dashboards";
import {
  getAdminStats,
  getTeacherStats,
  getStudentStats,
  getParentStats,
  getAccountantStats,
} from "@/lib/dashboard";

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
        stats = await getAdminStats(user.id);
        break;
      }
      case "TEACHER": {
        stats = await getTeacherStats(user.id);
        break;
      }
      case "STUDENT": {
        stats = await getStudentStats(user.id);
        break;
      }
      case "PARENT": {
        stats = await getParentStats(user.id);
        break;
      }
      case "ACCOUNTANT": {
        stats = await getAccountantStats(user.id);
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