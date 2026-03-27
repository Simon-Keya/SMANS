// app/actions/attendance/updateAttendance.ts
"use server";

import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateAttendanceSchema = z.object({
  attendanceId: z.string().min(1, "Attendance ID is required"),
  status: z.enum(["PRESENT", "ABSENT", "LATE"]),
  remarks: z.string().max(200).optional(),
});

export async function updateAttendance(input: unknown) {
  const user = await getCurrentUser();

  if (!user || !["ADMIN", "TEACHER"].includes(user.role)) {
    throw new Error("Unauthorized: Only admins and teachers can update attendance");
  }

  const validated = updateAttendanceSchema.safeParse(input);
  if (!validated.success) {
    throw new Error(validated.error.issues[0]?.message || "Invalid input");
  }

  const { attendanceId, status, remarks } = validated.data;

  try {
    const updated = await prisma.attendance.update({
      where: { id: attendanceId },
      data: {
        status,
        remarks: remarks?.trim() || null,
        markedById: user.id,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "UPDATE_ATTENDANCE",
        entity: "Attendance",
        entityId: attendanceId,
        metadata: { status, remarks },
      },
    });

    return {
      success: true,
      attendance: updated,
      message: `Attendance updated to ${status}`,
    };
  } catch (error: any) {
    console.error("Update attendance error:", error);
    throw new Error("Failed to update attendance. Please try again.");
  }
}