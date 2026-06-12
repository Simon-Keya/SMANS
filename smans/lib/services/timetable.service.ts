// lib/services/timetable.service.ts
import { prisma } from "@/lib/prisma";

export class TimetableService {
  /**
   * Create a new timetable period
   */
  static async createPeriod(data: {
    day: string;
    startTime: string;
    endTime: string;
    room?: string | null;
    classId: string;
    subjectId: string;
  }) {
    const { day, startTime, endTime, room, classId, subjectId } = data;

    // Validate class exists
    const cls = await prisma.class.findUnique({ where: { id: classId } });
    if (!cls) throw new Error("Class not found");

    // Validate subject exists
    const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
    if (!subject) throw new Error("Subject not found");

    // Check for conflicting timetable entry
    const conflict = await prisma.timetable.findFirst({
      where: {
        classId,
        day,
        OR: [
          {
            startTime: { lt: endTime },
            endTime: { gt: startTime },
          },
        ],
      },
    });

    if (conflict) {
      throw new Error(`Time conflict: Another period exists on ${day} between ${conflict.startTime} and ${conflict.endTime}`);
    }

    return prisma.timetable.create({
      data: {
        day: day.trim(),
        startTime: startTime.trim(),
        endTime: endTime.trim(),
        room: room?.trim() ?? null,
        classId,
        subjectId,
      },
      include: {
        class: { select: { id: true, name: true, level: true } },
        subject: { select: { id: true, name: true, code: true } },
      },
    });
  }

  /**
   * Get timetable for a specific class
   */
  static async getClassTimetable(classId: string, day?: string) {
    const where: any = { classId };
    if (day) where.day = day;

    return prisma.timetable.findMany({
      where,
      include: {
        class: { select: { name: true, level: true } },
        subject: { select: { id: true, name: true, code: true } },
      },
      orderBy: [
        { day: "asc" },
        { startTime: "asc" },
      ],
    });
  }

  /**
   * Get timetable for a specific subject across all classes
   */
  static async getSubjectTimetable(subjectId: string) {
    return prisma.timetable.findMany({
      where: { subjectId },
      include: {
        class: { select: { name: true, level: true } },
        subject: { select: { name: true, code: true } },
      },
      orderBy: [{ day: "asc" }, { startTime: "asc" }],
    });
  }

  /**
   * Get timetable period by ID
   */
  static async getPeriodById(id: string) {
    return prisma.timetable.findUnique({
      where: { id },
      include: {
        class: { select: { id: true, name: true, level: true } },
        subject: { select: { id: true, name: true, code: true } },
      },
    });
  }

  /**
   * Update a timetable period
   */
  static async updatePeriod(
    id: string,
    data: {
      day?: string;
      startTime?: string;
      endTime?: string;
      room?: string | null;
      classId?: string;
      subjectId?: string;
    }
  ) {
    const { day, startTime, endTime, room, classId, subjectId } = data;

    // Get existing period to check for conflicts
    const existing = await prisma.timetable.findUnique({ where: { id } });
    if (!existing) throw new Error("Timetable period not found");

    const targetClassId = classId || existing.classId;
    const targetDay = day || existing.day;
    const targetStartTime = startTime || existing.startTime;
    const targetEndTime = endTime || existing.endTime;

    // Check for conflicts with other periods
    const conflict = await prisma.timetable.findFirst({
      where: {
        id: { not: id },
        classId: targetClassId,
        day: targetDay,
        OR: [
          {
            startTime: { lt: targetEndTime },
            endTime: { gt: targetStartTime },
          },
        ],
      },
    });

    if (conflict) {
      throw new Error(`Time conflict: Another period exists on ${targetDay} between ${conflict.startTime} and ${conflict.endTime}`);
    }

    return prisma.timetable.update({
      where: { id },
      data: {
        day: day?.trim(),
        startTime: startTime?.trim(),
        endTime: endTime?.trim(),
        room: room?.trim() ?? null,
        classId: classId,
        subjectId: subjectId,
      },
      include: {
        class: { select: { name: true, level: true } },
        subject: { select: { name: true, code: true } },
      },
    });
  }

  /**
   * Delete a timetable period
   */
  static async deletePeriod(id: string) {
    const period = await prisma.timetable.findUnique({ where: { id } });
    if (!period) throw new Error("Timetable period not found");

    return prisma.timetable.delete({ where: { id } });
  }

  /**
   * Get weekly timetable for a class (grouped by day)
   */
  static async getWeeklyTimetable(classId: string) {
    const periods = await this.getClassTimetable(classId);
    
    // Group by day
    const weeklyTimetable: Record<string, typeof periods> = {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
    };

    for (const period of periods) {
      if (weeklyTimetable[period.day]) {
        weeklyTimetable[period.day].push(period);
      }
    }

    // Sort periods within each day by start time
    for (const day in weeklyTimetable) {
      weeklyTimetable[day].sort((a, b) => a.startTime.localeCompare(b.startTime));
    }

    return weeklyTimetable;
  }

  /**
   * Bulk create timetable periods for a class
   */
  static async bulkCreatePeriods(
    periods: Array<{
      day: string;
      startTime: string;
      endTime: string;
      room?: string | null;
      classId: string;
      subjectId: string;
    }>
  ) {
    return prisma.$transaction(async (tx) => {
      const results = [];

      for (const period of periods) {
        // Validate class exists
        const cls = await tx.class.findUnique({ where: { id: period.classId } });
        if (!cls) throw new Error(`Class not found for period: ${period.day} ${period.startTime}`);

        // Validate subject exists
        const subject = await tx.subject.findUnique({ where: { id: period.subjectId } });
        if (!subject) throw new Error(`Subject not found for period: ${period.day} ${period.startTime}`);

        // Check for conflicts
        const conflict = await tx.timetable.findFirst({
          where: {
            classId: period.classId,
            day: period.day,
            OR: [
              {
                startTime: { lt: period.endTime },
                endTime: { gt: period.startTime },
              },
            ],
          },
        });

        if (conflict) {
          throw new Error(`Time conflict on ${period.day} between ${conflict.startTime} and ${conflict.endTime}`);
        }

        const result = await tx.timetable.create({
          data: {
            day: period.day.trim(),
            startTime: period.startTime.trim(),
            endTime: period.endTime.trim(),
            room: period.room?.trim() ?? null,
            classId: period.classId,
            subjectId: period.subjectId,
          },
        });
        results.push(result);
      }

      return results;
    });
  }

  /**
   * Get teacher's timetable (all classes they teach)
   */
  static async getTeacherTimetable(teacherId: string) {
    // Get all classes taught by this teacher
    const classes = await prisma.class.findMany({
      where: { teacherId },
      select: { id: true, name: true, level: true },
    });

    const classIds = classes.map(c => c.id);

    if (classIds.length === 0) {
      return [];
    }

    return prisma.timetable.findMany({
      where: { classId: { in: classIds } },
      include: {
        class: { select: { name: true, level: true } },
        subject: { select: { name: true, code: true } },
      },
      orderBy: [{ day: "asc" }, { startTime: "asc" }],
    });
  }

  /**
   * Check if a time slot is available for a class
   */
  static async isTimeSlotAvailable(
    classId: string,
    day: string,
    startTime: string,
    endTime: string,
    excludeId?: string
  ) {
    const where: any = {
      classId,
      day,
      OR: [
        {
          startTime: { lt: endTime },
          endTime: { gt: startTime },
        },
      ],
    };

    if (excludeId) {
      where.id = { not: excludeId };
    }

    const conflict = await prisma.timetable.findFirst({ where });
    return !conflict;
  }

  /**
   * Get available time slots for a class
   */
  static async getAvailableTimeSlots(classId: string, day: string) {
    const existingPeriods = await prisma.timetable.findMany({
      where: { classId, day },
      orderBy: { startTime: "asc" },
    });

    const timeSlots = [
      "8:00-9:00", "9:00-10:00", "10:00-11:00",
      "11:00-12:00", "12:00-1:00", "1:00-2:00", "2:00-3:00", "3:00-4:00"
    ];

    const takenSlots = new Set(existingPeriods.map(p => `${p.startTime}-${p.endTime}`));
    const availableSlots = timeSlots.filter(slot => !takenSlots.has(slot));

    return availableSlots;
  }

  /**
   * Copy timetable from one class to another
   */
  static async copyTimetable(fromClassId: string, toClassId: string) {
    const sourcePeriods = await prisma.timetable.findMany({
      where: { classId: fromClassId },
    });

    if (sourcePeriods.length === 0) {
      throw new Error("No timetable periods to copy from source class");
    }

    // Check if destination class already has periods
    const existingPeriods = await prisma.timetable.count({
      where: { classId: toClassId },
    });

    if (existingPeriods > 0) {
      throw new Error("Destination class already has timetable periods. Please clear them first.");
    }

    return prisma.$transaction(async (tx) => {
      const newPeriods = [];
      for (const period of sourcePeriods) {
        const newPeriod = await tx.timetable.create({
          data: {
            day: period.day,
            startTime: period.startTime,
            endTime: period.endTime,
            room: period.room,
            classId: toClassId,
            subjectId: period.subjectId,
          },
        });
        newPeriods.push(newPeriod);
      }
      return newPeriods;
    });
  }

  /**
   * Clear all timetable periods for a class
   */
  static async clearClassTimetable(classId: string) {
    const result = await prisma.timetable.deleteMany({
      where: { classId },
    });
    return { deletedCount: result.count };
  }
}