// components/notifications/NotificationList.tsx
"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Check } from "lucide-react";
import { useState } from "react";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  createdAt: Date;
}

interface NotificationListProps {
  notifications: Notification[];
}

export default function NotificationList({ notifications }: NotificationListProps) {
  const [localNotifications, setLocalNotifications] = useState(notifications);

  const markAsRead = (id: string) => {
    setLocalNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    // TODO: API call to mark as read
  };

  return (
    <div className="space-y-4">
      {localNotifications.length === 0 ? (
        <div className="text-center py-12 text-base-content/60 bg-base-200 rounded-lg">
          No notifications at the moment.
        </div>
      ) : (
        localNotifications.map((notif) => (
          <div
            key={notif.id}
            className={`p-4 rounded-lg border ${
              notif.read ? "bg-base-100" : "bg-primary/10 border-primary"
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{notif.title}</h3>
                  {!notif.read && (
                    <Badge variant="default" className="bg-primary text-primary-content">
                      New
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-base-content/80 mt-1">{notif.message}</p>
                <p className="text-xs text-base-content/50 mt-2">
                  {new Date(notif.createdAt).toLocaleString()}
                </p>
              </div>

              {!notif.read && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => markAsRead(notif.id)}
                  className="text-success hover:text-success"
                >
                  <Check className="h-4 w-4 mr-1" />
                  Mark Read
                </Button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}