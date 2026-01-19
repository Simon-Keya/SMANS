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

  // Strict auth check + redirect with callback for better UX
  if (!session?.user) {
    redirect(`/auth/login?callbackUrl=${encodeURIComponent("/dashboard")}`);
  }

  const userRole = (session.user.role as string)?.toLowerCase() || "student";

  return (
    <div className="flex h-screen bg-base-100">
      {/* Sidebar - pass role so it can hide/show items */}
      <Sidebar role={userRole} />

      {/* Main content area – no Navbar anymore */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Scrollable main content – full height, no top bar */}
        <main className="flex-1 overflow-y-auto bg-base-200">
          {/* Container with responsive padding */}
          <div className="container mx-auto px-4 py-6 md:px-6 md:py-8 lg:px-8 lg:py-10 max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}