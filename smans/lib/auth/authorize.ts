// lib/auth/authorize.ts
import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { hasPermission, type Permission, type Role } from "./permissions";

export async function authorize(permission: Permission) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.role) {
    throw new Error("Unauthorized");
  }

  const allowed = hasPermission(
    session.user.role as Role,
    permission
  );

  if (!allowed) {
    throw new Error("Forbidden");
  }

  return session.user;
}