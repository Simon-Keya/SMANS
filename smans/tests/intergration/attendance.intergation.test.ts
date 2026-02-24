import request from "supertest";

describe("Attendance Integration", () => {
  it("should mark attendance", async () => {
    const res = await request(app)
      .post("/api/attendance/mark")
      .send({
        date: new Date().toISOString(),
        records: [
          { studentId: "stu1", status: "PRESENT" },
        ],
      });

    expect(res.status).toBe(200);
  });
});