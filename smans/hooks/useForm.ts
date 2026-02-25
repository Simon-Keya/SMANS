// hooks/useForm.ts
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, UseFormProps } from "react-hook-form";
import { ZodSchema } from "zod";

export function useZodForm<T extends ZodSchema>(schema: T, options?: UseFormProps<z.infer<T>>) {
  return useForm<z.infer<T>>({
    resolver: zodResolver(schema),
    ...options,
  });
}