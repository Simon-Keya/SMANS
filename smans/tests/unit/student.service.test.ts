import { prisma } from "@/lib/prisma";
import { StudentService } from "@/lib/services/student.service";

describe("StudentService Unit Tests", () => {
  beforeEach(async () => {
    await prisma.student.deleteMany();
    await prisma.class.deleteMany();
  });

  it("should create a student with valid data", async () => {
    const classObj = await prisma.class.create({
      data: { name: "Test Class", level: "Form 1" },
    });

    const input = {
      name: "Alice Mwangi",
      rollNumber: "STU/001/2025",
      email: "alice@example.com",
      phone: "0712345678",
      classId: classObj.id,
      parentId: null,
    };

    const student = await StudentService.create(input);

    expect(student.id).toBeDefined();
    expect(student.name).toBe(input.name);
    expect(student.rollNumber).toBe(input.rollNumber);
    expect(student.classId).toBe(classObj.id);
  });

  it("should throw validation error on missing required fields", async () => {
    await expect(
      StudentService.create({
        name: "Short",
        rollNumber: "STU001",
        classId: "invalid-id",
      } as any)
    ).rejects.toThrow("Invalid class ID");
  });

  it("should find student with relations", async () => {
    const cls = await prisma.class.create({ data: { name: "Form 2", level: "Form 2" } });

    const student = await prisma.student.create({
      data: {
        name: "Bob Omondi",
        rollNumber: "STU/002/2025",
        classId: cls.id,
      },
    });

    const found = await StudentService.findById(student.id);

    expect(found?.name).toBe("Bob Omondi");
    expect(found?.class.name).toBe("Form 2");
  });

  it("should update student details", async () => {
    const cls = await prisma.class.create({ data: { name: "Test", level: "Test" } });

    const student = await prisma.student.create({
      data: {
        name: "Old Name",
        rollNumber: "OLD/001",
        classId: cls.id,
      },
    });

    const updated = await StudentService.update(student.id, {
      name: "New Name",
      phone: "0711111111",
    });

    expect(updated.name).toBe("New Name");
    expect(updated.phone).toBe("0711111111");
  });

  it("should delete student", async () => {
    const cls = await prisma.class.create({ data: { name: "Delete", level: "Test" } });

    const student = await prisma.student.create({
      data: { name: "To Delete", rollNumber: "DEL/001", classId: cls.id },
    });

    await StudentService.delete(student.id);

    const found = await prisma.student.findUnique({ where: { id: student.id } });
    expect(found).toBeNull();
  });
});