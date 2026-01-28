"use server";

import { prisma } from "@/lib/prisma";

export async function sendNotification(
  userIds: string[],
  title: string,
  message: string
) {
  return prisma.notification.createMany({
    data: userIds.map(id => ({
      userId: id,
      title,
      message,
    })),
  });
}
