// lib/dashboard/parent.ts
import { prisma } from "@/lib/prisma";

export async function getParentStats(userId: string) {
  const children = await prisma.student.findMany({
    where: { parent: { userId } },
    include: { 
      class: {
        include: {
          subjects: true,
        },
      },
      grades: {
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { subject: true },
      },
      attendance: {
        where: {
          date: {
            gte: new Date(new Date().setDate(new Date().getDate() - 7)),
          },
        },
      },
      invoices: {
        where: {
          status: {
            in: ["PENDING", "PARTIAL", "OVERDUE"],
          },
        },
      },
    },
  });

  const [parentNotifications, parentUnread] = await Promise.all([
    prisma.notification.count({
      where: { userId },
    }),
    prisma.notification.count({
      where: { 
        userId,
        read: false,
      },
    }),
  ]);

  const totalPendingInvoices = children.reduce((acc, child) => acc + (child.invoices?.length || 0), 0);

  return {
    children,
    totalChildren: children.length,
    totalPendingInvoices,
    totalNotifications: parentNotifications,
    unreadNotifications: parentUnread,
  };
}