"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createTimetablePeriod(data: {
  class: string; // or classId if you have Class model
  day: string;
  time: string;
  subject: string;
  teacher?: string;
  room?: string;
}) {
  await prisma.timetable.create({
    data,
  });

  revalidatePath("/dashboard/timetable");
}

export async function updateTimetablePeriod(id: string, data: {
  subject: string;
  teacher?: string;
  room?: string;
}) {
  await prisma.timetable.update({
    where: { id },
    data,
  });

  revalidatePath("/dashboard/timetable");
}

export async function deleteTimetablePeriod(id: string) {
  await prisma.timetable.delete({
    where: { id },
  });

  revalidatePath("/dashboard/timetable");
}