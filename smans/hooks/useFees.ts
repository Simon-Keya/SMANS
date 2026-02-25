// hooks/useFees.ts
"use client";

import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useFees(studentId?: string) {
  const query = studentId ? `?studentId=${studentId}` : "";
  const { data, error, isLoading, mutate } = useSWR(`/api/fees${query}`, fetcher);

  return {
    invoices: data?.invoices ?? [],
    feeItems: data?.feeItems ?? [],
    isLoading,
    error,
    refresh: mutate,
  };
}