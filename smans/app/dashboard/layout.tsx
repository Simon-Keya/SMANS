import Navbar from "@/components/dashboard/Navbar";
import Sidebar from "@/components/dashboard/Sidebar";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // Redirect if no session (middleware should catch this, but double-check)
  if (!session?.user) {
    redirect("/auth/login?callbackUrl=/dashboard");
  }

  const userRole = (session.user.role as string)?.toLowerCase() || "student";

  // Role-specific sidebar visibility or props can be passed here if needed
  return (
    <div className="flex h-screen bg-base-100">
      {/* Sidebar - can be role-aware if you pass props */}
      <Sidebar role={userRole} />

      {/* Main Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar role={userRole} />

        <main className="flex-1 overflow-y-auto bg-base-200">
          <div className="container mx-auto px-4 py-8 max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}