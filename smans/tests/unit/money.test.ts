/**
 * Regression tests for money/Decimal helpers.
 * No live database required.
 */
import { Prisma } from "@prisma/client";
import {
  toDecimal,
  toNumber,
  addMoney,
  sumMoney,
  gteMoney,
  gtMoney,
  formatMoney,
} from "@/lib/money";

describe("money helpers", () => {
  it("converts number and string to Decimal", () => {
    expect(toDecimal(10.5).toString()).toBe("10.5");
    expect(toDecimal("10.50").toString()).toBe("10.5");
    expect(toDecimal(new Prisma.Decimal("3.14")).toString()).toBe("3.14");
  });

  it("adds without floating-point drift", () => {
    // classic 0.1 + 0.2 problem
    const sum = addMoney(0.1, 0.2);
    expect(sum.toString()).toBe("0.3");
    expect(toNumber(sum)).toBeCloseTo(0.3, 10);
  });

  it("sums payment amounts correctly", () => {
    const total = sumMoney([100, "50.25", new Prisma.Decimal("0.75")]);
    expect(total.toString()).toBe("151");
  });

  it("compares amounts with gte/gt", () => {
    expect(gteMoney(100, 100)).toBe(true);
    expect(gteMoney(100.01, 100)).toBe(true);
    expect(gteMoney(99.99, 100)).toBe(false);
    expect(gtMoney(100, 100)).toBe(false);
    expect(gtMoney(100.01, 100)).toBe(true);
  });

  it("formats KES currency", () => {
    const formatted = formatMoney(1500.5, "KES", "en-KE");
    expect(formatted).toMatch(/1,?500\.50/);
  });
});
