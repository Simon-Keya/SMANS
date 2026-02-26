// components/providers/ThemeProvider.tsx
"use client";

import { useTheme } from "@/hooks/useTheme";
import { ReactNode, useEffect } from "react";

/**
 * Theme provider that applies dark/light/system mode to <html>
 * Uses useTheme hook for persistence and system preference
 * suppressHydrationWarning prevents mismatch warnings
 */
export default function ThemeProvider({ children }: { children: ReactNode }) {
  const { theme, isDark } = useTheme();

  useEffect(() => {
    const root = document.documentElement;

    // Remove old classes
    root.classList.remove("light", "dark");

    if (theme === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.classList.add(prefersDark ? "dark" : "light");
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  return (
    <html lang="en" className={isDark ? "dark" : ""} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}