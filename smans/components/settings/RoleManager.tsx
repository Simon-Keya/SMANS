// components/settings/RoleManager.tsx
"use client";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import * as z from "zod";
// import { Permission } from "@/lib/permissions"; // Uncomment when you add permission selection

// Zod schema for role form
const roleSchema = z.object({
  name: z.string().min(2, "Role name must be at least 2 characters"),
  description: z.string().optional(),
  permissions: z.array(z.string()).min(1, "Select at least one permission"),
});

type RoleFormData = z.infer<typeof roleSchema>;

type Role = {
  id: string;
  name: string;
  description?: string | null;
  permissions: string[];
  _count?: { users: number };
};

export default function RoleManager() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false); // ← FIXED: added missing state

  const form = useForm<RoleFormData>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: "",
      description: "",
      permissions: [],
    },
  });

  // Fetch roles on mount
  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/roles");
      if (!res.ok) throw new Error("Failed to fetch roles");
      const data = await res.json();
      setRoles(data.roles || []);
    } catch (err) {
      toast.error("Could not load roles");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: RoleFormData) => {
    try {
      const method = selectedRole ? "PUT" : "POST";
      const url = selectedRole ? `/api/roles/${selectedRole.id}` : "/api/roles";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save role");
      }

      toast.success(selectedRole ? "Role updated" : "Role created");
      form.reset();
      setSelectedRole(null);
      setDialogOpen(false); // ← close dialog after success
      fetchRoles();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const onDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/roles/${deleteId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete role");

      toast.success("Role deleted");
      setDeleteId(null);
      fetchRoles();
    } catch (err) {
      toast.error("Could not delete role");
    }
  };

  const handleEdit = (role: Role) => {
    setSelectedRole(role);
    form.reset({
      name: role.name,
      description: role.description || "",
      permissions: role.permissions,
    });
    setDialogOpen(true); // ← open dialog when editing
  };

  const handleNew = () => {
    setSelectedRole(null);
    form.reset({ name: "", description: "", permissions: [] });
    setDialogOpen(true); // ← open dialog for new role
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Custom Roles</h3>
        <Button onClick={handleNew}>
          <Plus className="mr-2 h-4 w-4" />
          Create Role
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : roles.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No custom roles yet. Create one to get started.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {roles.map((role) => (
            <div
              key={role.id}
              className="border rounded-lg p-5 bg-card shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-lg">{role.name}</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {role.description || "No description"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Permissions: {role.permissions.length}
                  </p>
                  {role._count && (
                    <p className="text-xs text-muted-foreground">
                      Used by {role._count.users} user(s)
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(role)}
                  >
                    <Pencil className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeleteId(role.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedRole ? `Edit Role: ${selectedRole.name}` : "Create New Role"}
            </AlertDialogTitle>
          </AlertDialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Role Name</Label>
              <Input id="name" {...form.register("name")} />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" {...form.register("description")} />
            </div>

            <div className="space-y-2">
              <Label>Permissions</Label>
              {/* Placeholder - integrate real permission selector later */}
              <p className="text-sm text-muted-foreground italic">
                Permission selection coming soon (use PermissionMatrix or multi-select)
              </p>
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : selectedRole ? (
                  "Update Role"
                ) : (
                  "Create Role"
                )}
              </Button>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Role</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this role? This action cannot be undone.
              Users assigned to this role will lose their permissions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={onDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Role
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}