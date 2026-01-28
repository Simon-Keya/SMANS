"use server";

import { prisma } from "@/lib/prisma";

export async function generateFinanceReport() {
  return prisma.invoice.findMany({
    include: {
      student: true,
      payments: true,
    },
  });
}
