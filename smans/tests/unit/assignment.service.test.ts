import { AssignmentService } from "@/lib/services/assignment.service";

describe("AssignmentService", () => {
  it("should create assignment", async () => {
    const input = {
      title: "Math Homework",
      description: "Solve 10 problems",
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      classId: "cls_123",
      subjectId: "sub_math",
    };

    const assignment = await AssignmentService.create(input);
    expect(assignment.title).toBe(input.title);
  });
});