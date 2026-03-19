import { Button } from "@/components/ui/Button";
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { Bell } from "lucide-react";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";

// Explicit type for the selected log shape (prevents implicit any)
type NotificationLogWithRelations = {
  id: string;
  sentAt: Date;
  status: string;
  errorMessage: string | null;
  notification: {
    title: string;
  };
  recipient: {
    name: string | null;
    email: string | null;
  };
};

export default async function NotificationLogsPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const logs: NotificationLogWithRelations[] = await prisma.notificationLog.findMany({
    orderBy: { sentAt: "desc" },
    take: 50,
    select: {
      id: true,
      sentAt: true,
      status: true,
      errorMessage: true,
      notification: {
        select: {
          title: true,
        },
      },
      recipient: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary">Notification Logs</h1>
        <Button asChild className="gap-2">
          <Link href="/dashboard/notifications">
            <Bell className="h-4 w-4" />
            Back to Notifications
          </Link>
        </Button>
      </div>

      {logs.length === 0 ? (
        <div className="text-center py-12 text-base-content/60 bg-base-200 rounded-lg">
          No notification logs available yet.
        </div>
      ) : (
        <div className="rounded-xl border border-base-300 overflow-x-auto shadow-sm">
          <table className="w-full min-w-max table-auto">
            <thead>
              <tr className="border-b bg-base-200/80">
                <th className="text-left p-4 font-semibold">Title</th>
                <th className="text-left p-4 font-semibold">Recipient</th>
                <th className="text-left p-4 font-semibold">Sent</th>
                <th className="text-left p-4 font-semibold">Status</th>
                <th className="text-left p-4 font-semibold">Error</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr
                  key={log.id}
                  className="border-b hover:bg-base-300/50 transition-colors"
                >
                  <td className="p-4">{log.notification.title}</td>
                  <td className="p-4">
                    {log.recipient.name || "Unknown"} (
                    {log.recipient.email || "—"})
                  </td>
                  <td className="p-4 text-sm text-base-content/70">
                    {new Date(log.sentAt).toLocaleString()}
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                        log.status === "success"
                          ? "bg-success/20 text-success"
                          : "bg-error/20 text-error"
                      }`}
                    >
                      {log.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-error">
                    {log.errorMessage || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}