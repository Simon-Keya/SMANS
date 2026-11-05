/**
 * Regression: hasPermission central logic (no DB).
 */
import { hasPermission, type Role, type Permission } from "@/lib/auth/permissions";

describe("hasPermission", () => {
  it("ADMIN has all permissions", () => {
    expect(hasPermission("ADMIN", "grades:enter")).toBe(true);
    expect(hasPermission("ADMIN", "fees:write")).toBe(true);
    expect(hasPermission("ADMIN", "*")).toBe(true);
  });

  it("TEACHER can enter grades but not write fees", () => {
    expect(hasPermission("TEACHER", "grades:enter")).toBe(true);
    expect(hasPermission("TEACHER", "fees:write")).toBe(false);
  });

  it("STUDENT cannot enter grades", () => {
    expect(hasPermission("STUDENT", "grades:enter")).toBe(false);
    expect(hasPermission("STUDENT", "grades:read")).toBe(true);
  });

  it("ACCOUNTANT can write fees", () => {
    expect(hasPermission("ACCOUNTANT", "fees:write")).toBe(true);
    expect(hasPermission("ACCOUNTANT", "grades:enter")).toBe(false);
  });

  it("PARENT cannot write students", () => {
    expect(hasPermission("PARENT", "students:write")).toBe(false);
    expect(hasPermission("PARENT", "students:read")).toBe(true);
  });
});
