// hooks/useTheme.ts
"use client";

import { useEffect, useState } from "react";
import { useLocalStorage } from "./useLocalStorage";

type Theme = "light" | "dark" | "system";

interface UseThemeReturn {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
  toggleTheme: () => void;
}

/**
 * Custom hook for managing light/dark/system theme
 * Persists choice in localStorage
 * Respects system preference when "system" is selected
 */
export function useTheme(defaultTheme: Theme = "system"): UseThemeReturn {
  const [storedTheme, setStoredTheme] = useLocalStorage<Theme>("theme", defaultTheme);
  const [theme, setTheme] = useState<Theme>(storedTheme);

  // Sync localStorage when theme changes
  useEffect(() => {
    setStoredTheme(theme);
  }, [theme, setStoredTheme]);

  // Apply theme to document
  useEffect(() => {
    const root = window.document.documentElement;

    // Remove old classes
    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.classList.add(systemPrefersDark ? "dark" : "light");
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  // Listen for system preference changes
  useEffect(() => {
    if (theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = () => {
      const root = window.document.documentElement;
      root.classList.remove("light", "dark");
      root.classList.add(mediaQuery.matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return {
    theme,
    setTheme,
    isDark,
    toggleTheme,
  };
}