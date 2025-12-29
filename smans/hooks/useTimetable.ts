// hooks/useTimetable.ts
"use client";

import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useTimetable(classId?: string) {
  const url = classId ? `/api/timetable?class=${classId}` : "/api/timetable";
  const { data, error, isLoading } = useSWR(url, fetcher);

  return {
    periods: data,
    isLoading,
    isError: error,
  };
}