// app/actions/settings/general.actions.ts
"use server";

import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";

export async function updateGeneralSettings(data: {
  emailNotifications?: boolean;
  smsNotifications?: boolean;
  defaultTheme?: string;
  defaultLanguage?: string;
  defaultTimezone?: string;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  try {
    const settings = await prisma.generalSettings.upsert({
      where: { id: 1 },
      update: data,
      create: { id: 1, ...data },
    });

    revalidatePath("/dashboard/settings/general");
    return { success: true, settings };
  } catch (error) {
    console.error("General settings update error:", error);
    throw new Error("Failed to update general settings");
  }
}