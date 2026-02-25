// hooks/useDebounce.ts
"use client";

import { useEffect, useState } from "react";

/**
 * Debounces a value — useful for search inputs, filters, API calls, etc.
 * 
 * @param value The value to debounce
 * @param delay Delay in milliseconds (default 500ms)
 * @returns The debounced value
 * 
 * Example:
 * const debouncedSearch = useDebounce(searchTerm, 500);
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup timeout on value change or unmount
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}