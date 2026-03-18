// app/actions/settings/general.actions.ts
"use server";

import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";

interface GeneralSettingsData {
  emailNotifications?: boolean;
  smsNotifications?: boolean;
  defaultTheme?: string;
  defaultLanguage?: string;
  defaultTimezone?: string;
}

export async function updateGeneralSettings(data: GeneralSettingsData) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const settings = await prisma.generalSettings.upsert({
    where: { id: 1 },
    update: data,
    create: { id: 1, ...data },
  });

  revalidatePath("/dashboard/settings/general");
  return { success: true, settings };
}