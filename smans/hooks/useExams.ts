// hooks/useExams.ts
"use client";

import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useExams(classId?: string) {
  const query = classId ? `?classId=${classId}` : "";
  const { data, error, isLoading, mutate } = useSWR(`/api/exams${query}`, fetcher);

  return {
    exams: data?.exams ?? [],
    isLoading,
    error,
    refresh: mutate,
  };
}