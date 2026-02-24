import { DisciplineService } from "@/lib/services/discipline.service";

describe("DisciplineService", () => {
  it("should record discipline issue", async () => {
    const input = {
      studentId: "stu_123",
      issue: "Fighting",
      reportedBy: "teacher_456",
      date: new Date(),
    };

    const record = await DisciplineService.record(input);
    expect(record.issue).toBe("Fighting");
  });
});