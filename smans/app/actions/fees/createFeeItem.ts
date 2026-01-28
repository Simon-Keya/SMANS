"use server";

import { prisma } from "@/lib/prisma";

export async function createFeeItem(data: {
  name: string;
  amount: number;
}) {
  return prisma.feeItem.create({ data });
}
