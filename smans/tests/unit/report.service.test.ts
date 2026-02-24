import { ReportService } from "@/lib/services/report.service";

describe("ReportService", () => {
  it("should generate student report", async () => {
    const report = await ReportService.generateStudentReport("stu_123");
    expect(Array.isArray(report)).toBe(true);
  });
});