import Navbar from "@/components/dashboard/Navbar";
import Sidebar from "@/components/dashboard/Sidebar";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { authOptions } from "@/lib/auth";
import { BarChart3, CalendarCheck, GraduationCap, Users } from "lucide-react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // Redirect unauthenticated users to login with callback
  if (!session) {
    redirect("/auth/login?callbackUrl=/dashboard");
  }

  const userRole = session.user.role as string;
  const userName = session.user.name || "User";

  // Role-specific welcome messages and stats (mock data — replace with real queries later)
  const roleConfig = {
    admin: {
      title: "School Administrator",
      message: "Manage your entire institution from one powerful dashboard.",
      stats: [
        { label: "Total Students", value: "1,245", icon: Users },
        { label: "Active Teachers", value: "89", icon: GraduationCap },
        { label: "Classes Today", value: "156", icon: CalendarCheck },
        { label: "Avg Attendance", value: "94%", icon: BarChart3 },
      ],
    },
    teacher: {
      title: "Teacher",
      message: "View your classes, mark attendance, and track student progress.",
      stats: [
        { label: "Your Classes", value: "6", icon: CalendarCheck },
        { label: "Students", value: "178", icon: Users },
        { label: "Today's Attendance", value: "96%", icon: BarChart3 },
        { label: "Pending Grades", value: "12", icon: GraduationCap },
      ],
    },
    student: {
      title: "Student",
      message: "Stay on top of your schedule, grades, and school announcements.",
      stats: [
        { label: "Enrolled Classes", value: "8", icon: BarChart3 },
        { label: "Current Average", value: "A-", icon: BarChart3 },
        { label: "Attendance Rate", value: "98%", icon: CalendarCheck },
        { label: "Upcoming Tests", value: "3", icon: GraduationCap },
      ],
    },
    parent: {
      title: "Parent",
      message: "Monitor your child's academic journey and stay connected with the school.",
      stats: [
        { label: "Children", value: "2", icon: Users },
        { label: "Overall Average", value: "B+", icon: BarChart3 },
        { label: "Attendance", value: "95%", icon: CalendarCheck },
        { label: "Recent Reports", value: "2", icon: GraduationCap },
      ],
    },
  };

  const config = roleConfig[userRole as keyof typeof roleConfig] || roleConfig.admin;

  return (
    <div className="flex h-screen bg-base-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />

        <main className="flex-1 overflow-y-auto bg-base-200">
          <div className="container mx-auto px-4 py-8 max-w-7xl">
            {/* Personalized Welcome Section */}
            <div className="mb-10">
              <h1 className="text-4xl font-bold text-primary mb-2">
                Welcome back, {userName}!
              </h1>
              <p className="text-xl text-base-content/70">{config.message}</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              {config.stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <Card
                    key={index}
                    className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 border border-primary/10"
                  >
                    <CardHeader className="flex flex-row items-center gap-4 pb-3">
                      <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Icon className="w-8 h-8 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-base-content/60">{stat.label}</p>
                        <CardTitle className="text-3xl font-bold text-primary mt-1">
                          {stat.value}
                        </CardTitle>
                      </div>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>

            {/* Page Content */}
            <div className="bg-base-100 rounded-box shadow-lg p-6 md:p-8 border border-base-300">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}