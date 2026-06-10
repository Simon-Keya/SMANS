// app/api/roles/[id]/route.ts
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const roleSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  permissions: z.array(z.string()).optional(),
});

// Helper to get role data
async function getRoleData(roleName: string) {
  const permissions = await prisma.rolePermission.findMany({
    where: { role: roleName as any },
    include: { permission: true },
  });

  // Count users with this role
  const userCount = await prisma.user.count({
    where: { role: roleName as any },
  });

  return {
    name: roleName,
    userCount,
    permissions: permissions.map(rp => rp.permission),
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    
    // Since Role is an enum, the id should be the role name
    const roleName = id;
    const validRoles = ["ADMIN", "TEACHER", "STUDENT", "PARENT", "ACCOUNTANT"];
    
    if (!validRoles.includes(roleName)) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    const roleData = await getRoleData(roleName);

    return NextResponse.json({ 
      success: true, 
      role: {
        id: roleName,
        name: roleName,
        ...roleData
      }
    });
  } catch (error) {
    console.error("Fetch single role error:", error);
    return NextResponse.json({ error: "Failed to fetch role" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const validated = roleSchema.parse(body);

    const validRoles = ["ADMIN", "TEACHER", "STUDENT", "PARENT", "ACCOUNTANT"];
    if (!validRoles.includes(id)) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    // Prevent updating system roles (they are enums and cannot be modified)
    if (["ADMIN", "TEACHER", "STUDENT", "PARENT", "ACCOUNTANT"].includes(id)) {
      return NextResponse.json({ error: "Cannot modify system roles (they are enums)" }, { status: 403 });
    }

    // Update permissions in RolePermission table
    if (validated.permissions) {
      // Delete existing permissions
      await prisma.rolePermission.deleteMany({
        where: { role: id as any },
      });

      // Add new permissions
      for (const permissionCode of validated.permissions) {
        const permission = await prisma.permission.findUnique({
          where: { code: permissionCode },
        });
        
        if (permission) {
          await prisma.rolePermission.create({
            data: {
              role: id as any,
              permissionId: permission.id,
            },
          });
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      role: { id, name: id, ...validated }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 });
    }
    console.error("Update role error:", error);
    return NextResponse.json({ error: "Failed to update role" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    
    const validRoles = ["ADMIN", "TEACHER", "STUDENT", "PARENT", "ACCOUNTANT"];
    
    // Check if role exists
    if (!validRoles.includes(id)) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    // Check if any users have this role
    const userCount = await prisma.user.count({
      where: { role: id as any },
    });

    if (userCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete role with ${userCount} assigned users` },
        { status: 409 }
      );
    }

    // Prevent deleting system roles (they are enums and cannot be deleted)
    if (["ADMIN", "TEACHER", "STUDENT", "PARENT", "ACCOUNTANT"].includes(id)) {
      return NextResponse.json({ error: "Cannot delete system roles (they are enums)" }, { status: 403 });
    }

    // Delete all permissions associated with this role
    await prisma.rolePermission.deleteMany({
      where: { role: id as any },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete role error:", error);
    return NextResponse.json({ error: "Failed to delete role" }, { status: 500 });
  }
}