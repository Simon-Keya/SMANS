// components/notifications/NotificationChannels.tsx
"use client";

import { Checkbox } from "@/components/ui/Checkbox";
import { Label } from "@/components/ui/Label";
import { useState } from "react";

export default function NotificationChannels() {
  const [channels, setChannels] = useState({
    email: true,
    sms: false,
    app: true,
  });

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-primary">Delivery Channels</h3>
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="email"
            checked={channels.email}
            onCheckedChange={(checked) =>
              setChannels((prev) => ({ ...prev, email: !!checked }))
            }
          />
          <Label htmlFor="email">Send via Email</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="sms"
            checked={channels.sms}
            onCheckedChange={(checked) =>
              setChannels((prev) => ({ ...prev, sms: !!checked }))
            }
          />
          <Label htmlFor="sms">Send via SMS</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="app"
            checked={channels.app}
            onCheckedChange={(checked) =>
              setChannels((prev) => ({ ...prev, app: !!checked }))
            }
          />
          <Label htmlFor="app">Send via App Notification</Label>
        </div>
      </div>
    </div>
  );
}