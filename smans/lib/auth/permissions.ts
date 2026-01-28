export type Role = "admin" | "teacher" | "student" | "parent";

export const permissions: Record<Role, string[]> = {
  admin: ["*"],
  teacher: [
    "students.read",
    "attendance.write",
    "grades.write",
    "reports.read",
  ],
  student: ["grades.read", "attendance.read"],
  parent: ["grades.read", "attendance.read", "fees.read"],
};

export function hasPermission(
  role: Role,
  permission: string
): boolean {
  if (permissions[role]?.includes("*")) return true;
  return permissions[role]?.includes(permission) ?? false;
}
