// components/settings/GeneralSettingsForm.tsx
"use client";

import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { Switch } from "@/components/ui/Switch";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import * as z from "zod";

const schema = z.object({
  emailNotifications: z.boolean(),
  smsNotifications: z.boolean(),
  theme: z.enum(["light", "dark", "system"]),
  language: z.enum(["en", "sw"]),
  timezone: z.string(),
});

type FormData = z.infer<typeof schema>;

export default function GeneralSettingsForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      emailNotifications: true,
      smsNotifications: false,
      theme: "system",
      language: "en",
      timezone: "Africa/Nairobi",
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      // In real app: send to /api/settings/general
      console.log("Saving general settings:", data);
      toast.success("Settings updated");
    } catch (err) {
      toast.error("Failed to save settings");
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      {/* Notifications */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Notifications</h3>
        <div className="flex items-center justify-between">
          <Label htmlFor="emailNotifications">Email Notifications</Label>
          <Switch
            id="emailNotifications"
            checked={form.watch("emailNotifications")}
            onCheckedChange={(checked) => form.setValue("emailNotifications", checked)}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="smsNotifications">SMS Notifications</Label>
          <Switch
            id="smsNotifications"
            checked={form.watch("smsNotifications")}
            onCheckedChange={(checked) => form.setValue("smsNotifications", checked)}
          />
        </div>
      </div>

      {/* Appearance */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Appearance</h3>
        <div className="space-y-2">
          <Label>Theme</Label>
          <Select
            defaultValue={form.watch("theme")}
            onValueChange={(value) => form.setValue("theme", value as any)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Language & Timezone */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label>Language</Label>
          <Select
            defaultValue={form.watch("language")}
            onValueChange={(value) => form.setValue("language", value as any)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="sw">Kiswahili</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Timezone</Label>
          <Select
            defaultValue={form.watch("timezone")}
            onValueChange={(value) => form.setValue("timezone", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select timezone" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Africa/Nairobi">Africa/Nairobi (EAT)</SelectItem>
              <SelectItem value="Africa/Dar_es_Salaam">Africa/Dar es Salaam</SelectItem>
              {/* Add more as needed */}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button type="submit" className="w-full md:w-auto">
        Save General Settings
      </Button>
    </form>
  );
}