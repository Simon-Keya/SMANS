// components/settings/PermissionMatrix.tsx
"use client";

import { Card, CardContent } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { ScrollArea } from "@/components/ui/Scroll-area";
import { Permission } from "@/lib/permissions";
import { useState } from "react";

const sampleRoles = [
  { id: "admin", name: "Admin", permissions: ["*"] },
  { id: "teacher", name: "Teacher", permissions: ["students:read", "attendance:mark", "grades:enter"] },
  { id: "student", name: "Student", permissions: ["grades:read", "attendance:read"] },
  { id: "parent", name: "Parent", permissions: ["grades:read", "attendance:read", "fees:read"] },
];

const samplePermissions: Permission[] = [
  "users:read",
  "users:write",
  "students:read",
  "students:write",
  "attendance:mark",
  "attendance:read",
  "grades:enter",
  "grades:read",
  "exams:create",
  "reports:generate",
  "notifications:send",
  "fees:read",
  "settings:*",
];

export default function PermissionMatrix() {
  const [roles] = useState(sampleRoles);

  return (
    <Card>
      <CardContent className="p-6">
        <ScrollArea className="h-[500px] rounded-md border">
          <table className="w-full border-collapse">
            <thead className="sticky top-0 bg-background z-10">
              <tr className="border-b">
                <th className="p-4 text-left font-semibold">Permission</th>
                {roles.map((role) => (
                  <th key={role.id} className="p-4 text-center font-semibold">
                    {role.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {samplePermissions.map((perm) => (
                <tr key={perm} className="border-b hover:bg-muted/50">
                  <td className="p-4 font-medium">{perm}</td>
                  {roles.map((role) => (
                    <td key={role.id} className="p-4 text-center">
                      <Checkbox
                        checked={
                          role.permissions.includes("*") ||
                          role.permissions.includes(perm) ||
                          (perm.includes(":") &&
                            role.permissions.includes(perm.split(":")[0] + ":*"))
                        }
                        disabled
                        className="cursor-default"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </ScrollArea>

        <p className="text-sm text-muted-foreground mt-4 italic">
          This is a read-only matrix. To edit permissions, go to Roles management.
        </p>
      </CardContent>
    </Card>
  );
}