// app/api/settings/school/route.ts
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    // Update or create school settings (singleton pattern - only one record)
    const settings = await prisma.schoolSettings.upsert({
      where: { id: 1 }, // always ID 1
      update: body,
      create: { id: 1, ...body },
    });

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error("School settings update error:", error);
    return NextResponse.json({ error: "Failed to update school settings" }, { status: 500 });
  }
}