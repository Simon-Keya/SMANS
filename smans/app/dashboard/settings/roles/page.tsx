// app/dashboard/settings/roles/page.tsx
import RoleManager from "@/components/settings/RoleManager";

export default function RolesPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Roles & Permissions</h2>
      <p className="text-muted-foreground">
        Manage user roles and their permissions.
      </p>
      <RoleManager />
    </div>
  );
}