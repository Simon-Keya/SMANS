import { encryptSecret, decryptSecret } from "@/lib/crypto/secrets";

describe("secret encryption", () => {
  const prev = process.env.TWO_FACTOR_ENCRYPTION_KEY;

  afterEach(() => {
    if (prev === undefined) delete process.env.TWO_FACTOR_ENCRYPTION_KEY;
    else process.env.TWO_FACTOR_ENCRYPTION_KEY = prev;
  });

  it("round-trips with hex key", () => {
    process.env.TWO_FACTOR_ENCRYPTION_KEY = "a".repeat(64);
    const enc = encryptSecret("JBSWY3DPEHPK3PXP");
    expect(enc.startsWith("v1:")).toBe(true);
    expect(decryptSecret(enc)).toBe("JBSWY3DPEHPK3PXP");
  });

  it("handles legacy plaintext", () => {
    delete process.env.TWO_FACTOR_ENCRYPTION_KEY;
    process.env.NODE_ENV = "development";
    const enc = encryptSecret("SECRET");
    expect(enc).toBe("plain:SECRET");
    expect(decryptSecret(enc)).toBe("SECRET");
    expect(decryptSecret("LEGACYPLAIN")).toBe("LEGACYPLAIN");
  });
});
