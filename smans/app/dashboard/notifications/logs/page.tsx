import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function NotificationLogsPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    redirect("/dashboard");
  }

  const logs = await prisma.notificationLog.findMany({
    orderBy: { sentAt: "desc" },
    take: 50,
    select: {
      id: true,
      notification: { select: { title: true } },
      recipient: { select: { name: true, email: true } },
      sentAt: true,
      status: true,
      errorMessage: true,
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-primary">Notification Logs</h1>

      {logs.length === 0 ? (
        <div className="text-center py-12 text-base-content/60 bg-base-200 rounded-lg">
          No logs available yet.
        </div>
      ) : (
        <div className="rounded-md border overflow-x-auto">
          <table className="w-full min-w-max">
            <thead>
              <tr className="border-b bg-base-200">
                <th className="text-left p-4">Title</th>
                <th className="text-left p-4">Recipient</th>
                <th className="text-left p-4">Sent</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Error</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b hover:bg-base-300/50">
                  <td className="p-4">{log.notification.title}</td>
                  <td className="p-4">
                    {log.recipient.name} ({log.recipient.email})
                  </td>
                  <td className="p-4">
                    {new Date(log.sentAt).toLocaleString()}
                  </td>
                  <td className="p-4">
                    <span className={`badge ${log.status === "success" ? "badge-success" : "badge-error"}`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="p-4 text-error text-sm">
                    {log.errorMessage || "-"}
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