// app/api/settings/general/route.ts
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

    // General settings could be stored in a singleton table or as user preferences
    // Here we assume a singleton GeneralSettings table (id: 1)
    const settings = await prisma.generalSettings.upsert({
      where: { id: 1 },
      update: body,
      create: { id: 1, ...body },
    });

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error("General settings update error:", error);
    return NextResponse.json({ error: "Failed to update general settings" }, { status: 500 });
  }
}