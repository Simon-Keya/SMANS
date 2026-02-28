// app/dashboard/settings/school/page.tsx
import SchoolInfoForm from "@/components/settings/SchoolInfoForm";

export default function SchoolSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">School Information</h2>
        <p className="text-muted-foreground mt-1">
          Update basic school details, logo, contact information, and academic settings.
        </p>
      </div>

      <SchoolInfoForm />
    </div>
  );
}