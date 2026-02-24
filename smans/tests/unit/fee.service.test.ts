import { FeeService } from "@/lib/services/fee.service";

describe("FeeService", () => {
  it("should create fee item", async () => {
    const input = {
      name: "Tuition Fee",
      amount: 15000,
      frequency: "termly",
    };

    const fee = await FeeService.createFeeItem(input);
    expect(fee.amount).toBe(15000);
  });
});