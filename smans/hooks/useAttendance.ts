// hooks/useAttendance.ts
"use client";

import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useAttendance() {
  const { data, error, isLoading } = useSWR("/api/attendance", fetcher);

  return {
    attendance: data,
    isLoading,
    isError: error,
  };
}