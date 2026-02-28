// app/dashboard/settings/general/page.tsx
import GeneralSettingsForm from "@/components/settings/GeneralSettingsForm";

export default function GeneralSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">General Settings</h2>
        <p className="text-muted-foreground mt-1">
          Configure notifications, theme defaults, language and other global settings.
        </p>
      </div>

      <GeneralSettingsForm />
    </div>
  );
}