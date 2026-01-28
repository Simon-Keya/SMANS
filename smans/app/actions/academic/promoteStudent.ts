"use server";

import { prisma } from "@/lib/prisma";

export async function promoteStudents(
  classId: string,
  nextClassId: string
) {
  const students = await prisma.student.findMany({
    where: { classId },
  });

  return prisma.$transaction(
    students.map(s =>
      prisma.student.update({
        where: { id: s.id },
        data: {
          classId: nextClassId,
          promotionLogs: {
            create: {
              fromClass: classId,
              toClass: nextClassId,
            },
          },
        },
      })
    )
  );
}
