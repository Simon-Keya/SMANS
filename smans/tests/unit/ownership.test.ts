/**
 * Ownership helper regression — pure logic smoke for role matrix docs.
 * Full DB tests require integration env; this locks expected role rules.
 */
import type { Role } from "@/lib/auth/permissions";
import { hasPermission } from "@/lib/auth/permissions";

describe("ownership policy matrix (permission layer)", () => {
  const roles: Role[] = ["ADMIN", "TEACHER", "PARENT", "STUDENT", "ACCOUNTANT"];

  it("only staff with grades:enter can write grades", () => {
    expect(hasPermission("TEACHER", "grades:enter")).toBe(true);
    expect(hasPermission("PARENT", "grades:enter")).toBe(false);
    expect(hasPermission("STUDENT", "grades:enter")).toBe(false);
    expect(hasPermission("ACCOUNTANT", "grades:enter")).toBe(false);
  });

  it("fees:pay for parent/accountant flows", () => {
    expect(hasPermission("ACCOUNTANT", "fees:pay")).toBe(true);
    expect(hasPermission("PARENT", "fees:pay")).toBe(false); // pay via fees:read + dedicated action may extend
  });

  it("ADMIN always allowed", () => {
    for (const r of roles) {
      if (r === "ADMIN") {
        expect(hasPermission(r, "students:write")).toBe(true);
      }
    }
  });
});
