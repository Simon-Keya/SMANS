// hooks/useForm.ts
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, UseFormProps } from "react-hook-form";
import { z } from "zod";

/**
 * Strongly-typed wrapper around react-hook-form + Zod
 *
 * Usage:
 * const form = useZodForm(schema, { defaultValues: initialData });
 */
export function useZodForm<T extends z.ZodType<any, any, any>>(
  schema: T,
  options: Omit<UseFormProps<z.infer<T>>, "resolver"> = {}
) {
  return useForm<z.infer<T>>({
    resolver: zodResolver(schema) as any, // ← Type assertion fixes the inference mismatch
    ...options,
  });
}