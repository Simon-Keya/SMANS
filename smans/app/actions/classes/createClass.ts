"use server";

import { prisma } from "@/lib/prisma";

export async function createClass(data: {
  name: string;
  level: string;
}) {
  return prisma.class.create({ data });
}
