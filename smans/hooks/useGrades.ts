// hooks/useGrades.ts
"use client";

import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useGrades(studentId?: string) {
  const url = studentId ? `/api/grades?studentId=${studentId}` : "/api/grades";
  const { data, error, isLoading } = useSWR(url, fetcher);

  return {
    grades: data,
    isLoading,
    isError: error,
  };
}