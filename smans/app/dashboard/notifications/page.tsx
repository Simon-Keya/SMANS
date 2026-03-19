import { Button } from "@/components/ui/Button";
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { AlertCircle, Bell, CheckCircle } from "lucide-react";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";

// Define the expected shape of a notification (explicit type for clarity)
type Notification = {
  id: string;
  title: string;
  message: string;
  read: boolean;
  type?: "success" | "error" | "info" | "warning"; // optional, based on your schema
  createdAt: Date;
  userId: string;
};

export default async function NotificationsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  // Explicitly select only the fields we need (helps TypeScript infer correctly)
  const notifications: Notification[] = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      id: true,
      title: true,
      message: true,
      read: true,
      type: true,        // include if your schema has this field
      createdAt: true,
      userId: true,      // optional, but included for completeness
    },
  });

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary">Notifications</h1>
        <Button asChild className="btn-primary gap-2">
          <Link href="/dashboard/notifications/new">
            <Bell className="h-4 w-4" />
            New Notification
          </Link>
        </Button>
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-12 text-base-content/60 bg-base-200 rounded-lg">
          No notifications yet.
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 rounded-lg border ${
                notif.read ? "bg-base-100" : "bg-primary/10 border-primary"
              }`}
            >
              <div className="flex items-start gap-3">
                {notif.type === "success" ? (
                  <CheckCircle className="h-5 w-5 text-success mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-error mt-0.5" />
                )}
                <div className="flex-1">
                  <h3 className="font-medium">{notif.title}</h3>
                  <p className="text-sm text-base-content/70">{notif.message}</p>
                  <p className="text-xs text-base-content/50 mt-1">
                    {new Date(notif.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}