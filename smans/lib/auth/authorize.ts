import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { hasPermission } from "./permissions";

export async function authorize(permission: string) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.role) {
    throw new Error("Unauthorized");
  }

  const allowed = hasPermission(
    session.user.role as any,
    permission
  );

  if (!allowed) {
    throw new Error("Forbidden");
  }

  return session.user;
}
