// components/notifications/NotificationBadge.tsx
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Bell } from "lucide-react";

interface NotificationBadgeProps {
  count: number;
}

export default function NotificationBadge({ count }: NotificationBadgeProps) {
  return (
    <Button variant="ghost" size="icon" className="relative">
      <Bell className="h-5 w-5" />
      {count > 0 && (
        <Badge
          variant="destructive"
          className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-[10px] flex items-center justify-center"
        >
          {count > 99 ? "99+" : count}
        </Badge>
      )}
    </Button>
  );
}