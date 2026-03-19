import NotificationForm from "@/components/notifications/NotificationForm";
import { authOptions } from "@/lib/auth/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function NewNotificationPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-primary">Send New Notification</h1>
      <NotificationForm />
    </div>
  );
}