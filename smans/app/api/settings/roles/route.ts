// app/api/roles/route.ts
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Validation schema for creating/updating roles
const roleSchema = z.object({
  name: z.string().min(2, "Role name must be at least 2 characters"),
  description: z.string().optional(),
  permissions: z.array(z.string()).min(1, "At least one permission is required"),
});

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Since Role is an enum, return the predefined roles with their permissions
    const predefinedRoles = ["ADMIN", "TEACHER", "STUDENT", "PARENT", "ACCOUNTANT"];
    
    const rolesWithData = await Promise.all(
      predefinedRoles.map(async (roleName) => {
        // Get permissions for this role
        const rolePermissions = await prisma.rolePermission.findMany({
          where: { role: roleName as any },
          include: { permission: true },
        });

        // Count users with this role
        const userCount = await prisma.user.count({
          where: { role: roleName as any },
        });

        return {
          id: roleName,
          name: roleName,
          description: getRoleDescription(roleName),
          permissions: rolePermissions.map(rp => rp.permission),
          _count: { users: userCount },
        };
      })
    );

    return NextResponse.json({ success: true, roles: rolesWithData });
  } catch (error) {
    console.error("Fetch roles error:", error);
    return NextResponse.json({ error: "Failed to fetch roles" }, { status: 500 });
  }
}

// Helper function to get role descriptions
function getRoleDescription(roleName: string): string {
  const descriptions: Record<string, string> = {
    ADMIN: "Full system access and management",
    TEACHER: "Manage classes, assignments, and grades",
    STUDENT: "Access to learning materials and grades",
    PARENT: "Monitor child's academic progress",
    ACCOUNTANT: "Manage fees and financial records",
  };
  return descriptions[roleName] || "Custom role with specific permissions";
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validated = roleSchema.parse(body);

    // Check if the role already exists in the enum
    const predefinedRoles = ["ADMIN", "TEACHER", "STUDENT", "PARENT", "ACCOUNTANT"];
    
    if (predefinedRoles.includes(validated.name)) {
      return NextResponse.json({ 
        error: "Cannot create system role that already exists" 
      }, { status: 409 });
    }

    // Since you can't create new roles dynamically with an enum,
    // you would need to either:
    // 1. Add the role to the Role enum in schema (requires migration)
    // 2. Or create a Role model for custom roles
    
    return NextResponse.json({ 
      error: "Dynamic role creation is not supported with Role enum. Please add new roles to the schema or create a Role model.",
      suggestion: "Either add '${validated.name}' to the Role enum in schema.prisma, or create a separate Role model for custom roles."
    }, { status: 501 });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Create role error:", error);
    return NextResponse.json({ error: "Failed to create role" }, { status: 500 });
  }
}