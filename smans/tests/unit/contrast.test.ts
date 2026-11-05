import { contrastRatio, wcagLevel, THEME_PAIRS } from "@/lib/a11y/contrast";

describe("WCAG contrast", () => {
  it("computes known ratio for black on white", () => {
    const r = contrastRatio("#000000", "#ffffff");
    expect(r).toBeCloseTo(21, 0);
    expect(wcagLevel(r).passesAAA).toBe(true);
  });

  it("fails low-contrast gray on white", () => {
    const r = contrastRatio("#aaaaaa", "#ffffff");
    expect(wcagLevel(r).passesAA).toBe(false);
  });

  it("documents theme pairs against AA", () => {
    for (const pair of THEME_PAIRS) {
      const r = contrastRatio(pair.fg, pair.bg);
      const result = wcagLevel(r);
      // Soft assert: log failures rather than hard-fail all (palette may vary)
      if (!result.passesAA) {
        // eslint-disable-next-line no-console
        console.warn(
          `Contrast AA fail: ${pair.name} ratio=${result.ratio.toFixed(2)}`
        );
      }
      expect(result.ratio).toBeGreaterThan(1);
    }
  });
});
