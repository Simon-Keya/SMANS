/**
 * WCAG contrast utilities — compute numerically, do not eyeball.
 * Relative luminance per WCAG 2.x relative luminance formula.
 */

function srgbToLinear(c: number): number {
  const cs = c / 255;
  return cs <= 0.04045 ? cs / 12.92 : Math.pow((cs + 0.055) / 1.055, 2.4);
}

export function relativeLuminance(hex: string): number {
  const h = hex.replace("#", "").trim();
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  if (full.length !== 6) throw new Error(`Invalid hex color: ${hex}`);
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  const R = srgbToLinear(r);
  const G = srgbToLinear(g);
  const B = srgbToLinear(b);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

/** Contrast ratio between two hex colors (WCAG). */
export function contrastRatio(fg: string, bg: string): number {
  const L1 = relativeLuminance(fg);
  const L2 = relativeLuminance(bg);
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
}

export type WcagLevel = "AAA" | "AA" | "fail";

export function wcagLevel(
  ratio: number,
  largeText = false
): { level: WcagLevel; ratio: number; passesAA: boolean; passesAAA: boolean } {
  const aa = largeText ? 3 : 4.5;
  const aaa = largeText ? 4.5 : 7;
  const passesAA = ratio >= aa;
  const passesAAA = ratio >= aaa;
  const level: WcagLevel = passesAAA ? "AAA" : passesAA ? "AA" : "fail";
  return { level, ratio, passesAA, passesAAA };
}

/** Common SMANS theme pairs — verify AA. */
export const THEME_PAIRS: Array<{ name: string; fg: string; bg: string }> = [
  { name: "primary on white", fg: "#570df8", bg: "#ffffff" },
  { name: "base-content on base-100", fg: "#1f2937", bg: "#ffffff" },
  { name: "error on white", fg: "#f87272", bg: "#ffffff" },
  { name: "success on white", fg: "#36d399", bg: "#ffffff" },
];
