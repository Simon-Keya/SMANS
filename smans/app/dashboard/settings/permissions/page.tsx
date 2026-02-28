// app/dashboard/settings/permissions/page.tsx
import PermissionMatrix from "@/components/settings/PermissionMatrix";

export default function PermissionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Permissions Matrix</h2>
        <p className="text-muted-foreground mt-1">
          Fine-tune which roles can access which features.
        </p>
      </div>

      <PermissionMatrix />
    </div>
  );
}