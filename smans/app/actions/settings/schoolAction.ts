// app/actions/settings/school.actions.ts
"use server";

import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";

export async function updateSchoolSettings(data: {
  schoolName?: string;
  logoUrl?: string;
  address?: string;
  phone?: string;
  email?: string;
  academicYearStart?: string;
  academicYearEnd?: string;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  try {
    const settings = await prisma.schoolSettings.upsert({
      where: { id: 1 },
      update: data,
      create: { id: 1, ...data },
    });

    revalidatePath("/dashboard/settings/school");
    return { success: true, settings };
  } catch (error) {
    console.error("School settings update error:", error);
    throw new Error("Failed to update school settings");
  }
}