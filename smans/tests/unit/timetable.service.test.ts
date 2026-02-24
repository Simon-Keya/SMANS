import { TimetableService } from "@/lib/services/timetable.service";

describe("TimetableService", () => {
  it("should create a timetable entry", async () => {
    const input = {
      day: "Monday",
      startTime: "08:00",
      endTime: "09:30",
      classId: "cls_123",
      subjectId: "sub_math",
    };

    const entry = await TimetableService.create(input);

    expect(entry.day).toBe("Monday");
    expect(entry.startTime).toBe("08:00");
  });
});