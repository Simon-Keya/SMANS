// app/dashboard/settings/layout.tsx
import SettingsSidebar from "@/components/settings/SettingsSidebar";
import { authOptions } from "@/lib/auth/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // Protect entire settings section
  if (!session || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <SettingsSidebar />

        {/* Main content */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}