// hooks/useTeachers.ts
"use client";

import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useTeachers(search = "") {
  const query = search ? `?search=${encodeURIComponent(search)}` : "";
  const { data, error, isLoading, mutate } = useSWR(`/api/teachers${query}`, fetcher);

  return {
    teachers: data?.teachers ?? [],
    isLoading,
    error,
    refresh: mutate,
  };
}